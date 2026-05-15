
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  makeStyles,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Spinner,
  Field,
  ProgressBar,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Dropdown,
  Option,
  Combobox,
  Tag,
  TagPicker,
  TagPickerControl,
  TagPickerGroup,
  TagPickerInput,
  TagPickerList,
  TagPickerOption,
  Switch,
} from '@fluentui/react-components';
import {
  ArrowUpload20Regular,
  Checkmark20Filled,
  SlideText20Regular,
  Document20Regular,
} from '@fluentui/react-icons';
import { RootState } from '@/store';
import {
  useGetWorkflowFiltersQuery,
  useGetCompaniesbyUserQuery,
  useGetAuthorsQuery,
  useGetDocIDMutation,
  useSubmitReportToEFAMutation,
} from '@/services/apiSlice';
import { getCurrentLanguageIdFromSettings } from '@/utils/languageUtils';
import { getCurrentPresentationBlob, getCurrentDocumentName } from '@/utils/documentOpenUtils';
import { ApiName, AuthorDetails, Common, LANGUAGE_MAPPING, SupportedLanguage } from '@/utils/constants';
import { Company } from '@/interfaces/Company';
import { Author } from '@/interfaces/Author';

// Helper function to check if file is PowerPoint
const isPowerPointFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase();
  return ext.endsWith('.pptx') || ext.endsWith('.ppt');
};

// Helper function to check if file is Word document
const isWordFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase();
  return ext.endsWith('.docx') || ext.endsWith('.doc');
};

// Supported file extensions
const SUPPORTED_EXTENSIONS = ['.docx', '.doc', '.pptx', '.ppt'];

// Sentinel company representing "no company selected" (EFACorpID: -1)
const NONE_COMPANY: Company = {
  corpId: '-1',
  corpName: 'Non-Corporate',
  shortName: '',
  market: '',
  sector: '',
  model: '',
  securityId: '',
  industry: '',
  annPub: false,
  annUnPub: false,
  userID: "",
  relationshipIds: "",
};

const useStyles = makeStyles({
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  uploadArea: {
    border: "2px dashed #ccc",
    borderRadius: "4px",
    padding: "32px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
    backgroundColor: "#f5f5f5",
  },
  fileSelected: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  fileInfo: {
    flex: 1,
  },
});

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
  existingDocNames?: string[];
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
  existingDocNames = [],
}) => {
  const styles = useStyles();
  const settings = useSelector((state: RootState) => state.settings);

  const [useCurrentPresentation, setUseCurrentPresentation] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const docNameConflict = useMemo(() => {
    const trimmed = docName.trim().toLowerCase();
    if (!trimmed) return false;
    return existingDocNames.some(
      (n) => n.replace(/\.[^/.]+$/, '').toLowerCase() === trimmed
    );
  }, [docName, existingDocNames]);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [selectedCompany, setSelectedCompany] = useState<Company>(NONE_COMPANY);
  const [companySearchText, setCompanySearchText] = useState('Non-Corporate');
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [selectedLanguageKey, setSelectedLanguageKey] = useState<string>(
    settings.selectedLanguage || "en",
  );
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [authorSearchText, setAuthorSearchText] = useState('');
  const [fdrwWordID, setFdrwWordID] = useState<string>('21');

  // Determine if the selected file is a PowerPoint
  const isPowerPoint = useMemo(() => {
    if (useCurrentPresentation) return true;
    return selectedFile ? isPowerPointFile(selectedFile.name) : false;
  }, [selectedFile, useCurrentPresentation]);

  // Auto-populate docName from the currently open Office document
  useEffect(() => {
    if (open && useCurrentPresentation) {
      const name = getCurrentDocumentName();
      if (name) setDocName(name);
    }
  }, [open, useCurrentPresentation]);

  // Get account info for API calls
  const account = settings.account;
  const accountID = account?.AccountID ? parseInt(account.AccountID, 10) : 0;
  const accountName = account?.AccountName || "";
  const userID = account?.UserID ? parseInt(account.UserID, 10) : 0;
  const srvrID = account?.SrvrID ? parseInt(account.SrvrID, 10) : 0;
  const firmID = settings.userInfo?.FirmID ? parseInt(settings.userInfo.FirmID, 10) : 0;

  // Check if we have required params for company query
  const hasRequiredParams = !!(account?.AccountID && account?.AccountName && account?.SrvrID && account?.UserID);
  const languageId = getCurrentLanguageIdFromSettings(settings.selectedLanguage);

  // Fetch companies for the user
  const { data: companiesResponse, isLoading: isLoadingCompanies } =
    useGetCompaniesbyUserQuery(
      {
        SrvrID: account?.SrvrID || "",
        AccountID: account?.AccountID || "",
        LanguageID: languageId,
        UserID: userID,
        AccountName: account?.AccountName || "",
      },
      { skip: !hasRequiredParams },
    );

  // Filter companies based on search text
  const filteredCompanies = useMemo(() => {
    const companies =
      companiesResponse?.Data && Array.isArray(companiesResponse.Data)
        ? companiesResponse.Data
        : [];
    const isShowingSelection = companySearchText === selectedCompany.corpName;
    if (!companySearchText || isShowingSelection) return companies.slice(0, 50);
    const searchLower = companySearchText.toLowerCase();
    return companies
      .filter(
        (c) =>
          c.corpName.toLowerCase().includes(searchLower) ||
          c.shortName.toLowerCase().includes(searchLower),
      )
      .slice(0, 50);
  }, [companiesResponse, companySearchText, selectedCompany.corpName]);

  // Fetch all authors for the PowerPoint author selector
  const { data: allAuthorsData, isLoading: isLoadingAuthors } = useGetAuthorsQuery(
    {
      ApiName: ApiName.AnalystCoverageEx,
      AccountName: accountName,
      UserID: '',
      CorpID: '',
      SrvrID: account?.SrvrID || '',
      ListByCorp: Common.LIST_BY_CORP,
    },
    { skip: !isPowerPoint || !accountName || !account?.SrvrID }
  );

  const allAuthors = useMemo<Author[]>(() => {
    if (!allAuthorsData?.Data || !Array.isArray(allAuthorsData.Data)) return [];
    const seen = new Set<string>();
    return allAuthorsData.Data.flatMap(
      (corp: { authors?: Author[] }) => corp.authors || [],
    )
      .filter((author: Author) => {
        if (seen.has(author.authorId)) return false;
        seen.add(author.authorId);
        return true;
      })
      .sort((a: Author, b: Author) =>
        (a.fullName ?? "").localeCompare(b.fullName ?? ""),
      );
  }, [allAuthorsData]);

  const filteredAuthorsOptions = useMemo<Author[]>(() => {
    if (!authorSearchText) return allAuthors.slice(0, 50);
    const lower = authorSearchText.toLowerCase();
    return allAuthors
      .filter((a: Author) => a.fullName.toLowerCase().includes(lower))
      .slice(0, 50);
  }, [allAuthors, authorSearchText]);

  // Fetch workflow templates for PowerPoint files
  const { data: workflowFilters, isLoading: isLoadingTemplates } = useGetWorkflowFiltersQuery(
    { AccountName: accountName, SrvrID: srvrID },
    { skip: !isPowerPoint || !accountName || !srvrID }
  );
  
  // Get templates from workflow filters
  const workflowTemplates = workflowFilters?.Data?.Templates || [];
  console.log('[DocumentUploadDialog] workflowFilters raw:', workflowFilters);
  console.log('[DocumentUploadDialog] workflowTemplates:', workflowTemplates);
  console.log('[DocumentUploadDialog] selectedTemplateId:', selectedTemplateId);

  // Default to the last template when templates load
  useEffect(() => {
    console.log('[DocumentUploadDialog] useEffect templates — length:', workflowTemplates.length, 'selectedTemplateId:', selectedTemplateId);
    if (workflowTemplates.length > 0 && selectedTemplateId === null) {
      const defaultTemplate = workflowTemplates[workflowTemplates.length - 1];
      console.log('[DocumentUploadDialog] Auto-selecting default template:', defaultTemplate);
      setSelectedTemplateId(defaultTemplate.TemplateID);
    }
  }, [workflowTemplates.length]);

  // API mutations
  const [getDocID] = useGetDocIDMutation();
  const [submitReportToEFA] = useSubmitReportToEFAMutation();

  const handleFileSelect = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();
    const isSupported = SUPPORTED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );

    if (isSupported) {
      setSelectedFile(file);
      // Remove extension from filename for document name
      setDocName(file.name.replace(/\.(docx?|doc|pptx?|ppt)$/i, ''));
      setError(null);
      setSelectedTemplateId(null); // Reset template selection when file changes
      // Don't reset company - user may want to keep it
    } else {
      setError('Please select a Word document (.docx, .doc) or PowerPoint presentation (.pptx, .ppt)');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleUpload = useCallback(async () => {
    if (!docName.trim()) {
      setError('Please provide a document name');
      return;
    }

    if (!useCurrentPresentation && !selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (docNameConflict) {
      setError('A document with this name already exists. Please choose a different name.');
      return;
    }

    // For PowerPoint files, require authors
    if (isPowerPoint && selectedAuthors.length === 0) {
      setError('Please select at least one author for PowerPoint presentations');
      return;
    }

    // For PowerPoint files, require a template selection
    if (isPowerPoint && selectedTemplateId === null) {
      setError('Please select a template for PowerPoint presentations');
      return;
    }

    if (!accountID || !userID || !accountName) {
      setError(
        "Account information not available. Please try logging in again.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get file as base64 — either from the current open presentation or a browsed file
      let fileBase64: string;
      let fileExtension: string;

      if (useCurrentPresentation) {
        fileBase64 = await getCurrentPresentationBlob();
        fileExtension = 'pptx';
      } else {
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data:... prefix to get just the base64 content
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(selectedFile!);
        });
        fileExtension = selectedFile!.name.split('.').pop() || '';
      }

      // Prepare document name with extension
      const fullDocName = `${docName.trim()}.${fileExtension}`;

      // Generate a new DocID
      const docIdResponse = await getDocID({
        AccountName: accountName,
        AccountID: accountID,
        UserID: userID.toString(),
        SrvrID: srvrID,
        CorpID: parseInt(selectedCompany.corpId, 10),
        DocName: fullDocName,
      }).unwrap();

      if (!docIdResponse?.Data?.DocID) {
        throw new Error("Failed to generate document ID");
      }

      const newDocID = docIdResponse.Data.DocID;

      // Build DocVariables - these are required for the document to be publishable
      const docVariables: { Name: string; Value: string }[] = [];
      
      // Required document properties for publishing
      // FDRW_Account - The account name
      docVariables.push({ Name: 'FDRW_Account', Value: accountName });
      // EFAAccountID - The account ID (integer)
      docVariables.push({ Name: 'EFAAccountID', Value: accountID.toString() });
      // EFADocID - The document ID (integer)
      docVariables.push({ Name: 'EFADocID', Value: newDocID.toString() });
      // EFACorpID - The corporation ID (integer, -1 for None)
      docVariables.push({ Name: 'EFACorpID', Value: selectedCompany.corpId.toString() });
      // EFAModel - The company model (e.g. 'Life', 'Banks') — omitted for non-corporate to avoid validation error
      if (selectedCompany.corpId !== '-1' && selectedCompany.model) {
        docVariables.push({ Name: 'EFAModel', Value: selectedCompany.model });
      }
      // EFADevData - '1' = unpublished/dev data (drafts always start unpublished)
      docVariables.push({ Name: 'EFADevData', Value: '1' });
      
      // For PowerPoint files, add template and additional variables
      if (isPowerPoint && selectedTemplateId) {
        docVariables.push({ Name: 'EFATemplateID', Value: selectedTemplateId.toString() });
      }
      if (isPowerPoint) {
        docVariables.push({ Name: 'FDRW_WordID', Value: fdrwWordID || '21' });
        // Format date as YYYYMMDD HH:MM:SS
        const dateObj = new Date(submissionDate + 'T00:00:00');
        const now = new Date();
        const formattedDate = `${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        docVariables.push({ Name: 'EFALastRefreshDate', Value: formattedDate });
        const langId = LANGUAGE_MAPPING[selectedLanguageKey as SupportedLanguage]?.apiId || '2057';
        docVariables.push({ Name: 'EFALanguageID', Value: langId });
        if (selectedAuthors.length > 0) {
          docVariables.push({ Name: 'EFAAuthorNames', Value: selectedAuthors.map(a => a.fullName).join(', ') });
          docVariables.push({ Name: 'EFAAuthorIDs', Value: selectedAuthors.map(a => a.authorId).join('|') });
          // Per-author variables matching populateDocPropertiesData format
          const efaPrefix = Common.EFA_PREFIX;
          selectedAuthors.forEach((author, index) => {
            const suffix = index !== 0 ? `__${index}` : '';
            const fields: [string, keyof typeof author][] = [
              [AuthorDetails.AuthorName, 'fullName'],
              [AuthorDetails.AuthorGivenName, 'givenName'],
              [AuthorDetails.AuthorMiddleName, 'middleName'],
              [AuthorDetails.AuthorFamilyName, 'familyName'],
              [AuthorDetails.AuthorEmail, 'authorEmail'],
              [AuthorDetails.AuthorJobTitle, 'authorJobTitle'],
            ];
            fields.forEach(([key, field]) => {
              const value = (author[field] ?? '') as string;
              if (value) docVariables.push({ Name: efaPrefix + key + suffix, Value: value });
            });
          });
        }
      }

      // Call submitReportToEFA API (existing endpoint that works for Word)
      const saveResponse = await submitReportToEFA({
        AccountID: accountID,
        AccountName: accountName,
        DocID: newDocID,
        DocName: fullDocName,
        DocBlob: fileBase64,
        CorpID: parseInt(selectedCompany.corpId, 10),
        UserID: userID,
        SrvrID: srvrID,
        DocVariables: docVariables,
      }).unwrap();

      if (saveResponse?.StatusCode !== 200) {
        throw new Error(saveResponse?.Message || "Failed to save document");
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        onUploadComplete?.();
        // Reset state
        setUseCurrentPresentation(true);
        setSelectedFile(null);
        setDocName("");
        setSuccess(false);
        setIsLoading(false);
        setSelectedTemplateId(null);
        setSelectedCompany(NONE_COMPANY);
        setCompanySearchText('Non-Corporate');
        setSubmissionDate(new Date().toISOString().split('T')[0]);
        setSelectedLanguageKey(settings.selectedLanguage || 'en');
        setSelectedAuthors([]);
        setAuthorSearchText('');
        setFdrwWordID('21');
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [
    useCurrentPresentation,
    selectedFile, 
    docName, 
    selectedCompany, 
    accountID, 
    accountName, 
    userID, 
    srvrID, 
    onOpenChange, 
    onUploadComplete, 
    isPowerPoint, 
    selectedTemplateId,
    getDocID,
    submitReportToEFA,
    submissionDate,
    selectedLanguageKey,
    selectedAuthors,
    fdrwWordID,
    settings.selectedLanguage,
    docNameConflict,
  ]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onOpenChange(false);
      setUseCurrentPresentation(true);
      setSelectedFile(null);
      setDocName("");
      setError(null);
      setSuccess(false);
      setSelectedTemplateId(null);
      setSelectedCompany(NONE_COMPANY);
      setCompanySearchText('Non-Corporate');
      setSubmissionDate(new Date().toISOString().split('T')[0]);
      setSelectedLanguageKey(settings.selectedLanguage || 'en');
      setSelectedAuthors([]);
      setAuthorSearchText('');
      setFdrwWordID('21');
    }
  }, [isLoading, onOpenChange, settings.selectedLanguage]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => data.open || handleClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Upload Document to Drafts</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {success ? (
              <MessageBar intent="success">
                <MessageBarBody>
                  <MessageBarTitle>Success!</MessageBarTitle>
                  Document uploaded successfully to Drafts.
                </MessageBarBody>
              </MessageBar>
            ) : (
              <>
                {error && (
                  <MessageBar intent="error">
                    <MessageBarBody>
                      <MessageBarTitle>Error</MessageBarTitle>
                      {error}
                    </MessageBarBody>
                  </MessageBar>
                )}

                <Switch
                  label={useCurrentPresentation ? 'Use current open presentation' : 'Upload from file'}
                  checked={useCurrentPresentation}
                  disabled={isLoading}
                  onChange={(_, data) => {
                    setUseCurrentPresentation(data.checked);
                    if (data.checked) {
                      setSelectedFile(null);
                      setSelectedTemplateId(null);
                      const name = getCurrentDocumentName();
                      if (name) setDocName(name);
                    } else {
                      setDocName('');
                    }
                  }}
                />

                {useCurrentPresentation ? (
                  <div className={styles.fileSelected}>
                    <SlideText20Regular />
                    <div className={styles.fileInfo}>
                      <div style={{ fontWeight: 600 }}>Current open presentation</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        The currently open PowerPoint will be uploaded
                      </div>
                    </div>
                  </div>
                ) : !selectedFile ? (
                  <label>
                    <div
                      className={styles.uploadArea}
                      style={
                        isDragging
                          ? {
                              borderColor: "#0078d4",
                              backgroundColor: "#f0f6fc",
                            }
                          : undefined
                      }
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div style={{ marginBottom: "12px" }}>
                        <ArrowUpload20Regular />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        Drag and drop a Word or PowerPoint document here
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        or click to browse (.docx, .doc, .pptx, .ppt)
                      </div>
                    </div>
                    <input
                      type='file'
                      accept='.docx,.doc,.pptx,.ppt'
                      style={{ display: 'none' }}
                      onChange={handleFileInputChange}
                    />
                  </label>
                ) : (
                  <div className={styles.fileSelected}>
                    {isPowerPoint ? <SlideText20Regular /> : <Document20Regular />}
                    <div className={styles.fileInfo}>
                      <div style={{ fontWeight: 600 }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatFileSize(selectedFile.size)} ({isPowerPoint ? 'PowerPoint' : 'Word'})
                      </div>
                    </div>
                    <Button
                      appearance="subtle"
                      size="small"
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedTemplateId(null);
                        setSelectedCompany(NONE_COMPANY);
                        setCompanySearchText('Non-Corporate');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <Field
                  label='Document Name'
                  required
                  validationState={docNameConflict ? 'error' : 'none'}
                  validationMessage={
                    docNameConflict
                      ? 'A document with this name already exists'
                      : undefined
                  }
                >
                  <Input
                    value={docName}
                    onChange={(_, data) => setDocName(data.value)}
                    placeholder='Enter document name'
                    disabled={isLoading}
                  />
                </Field>

                {/* Authors - required for PowerPoint */}
                {isPowerPoint && (
                  <Field label='Authors' required hint='Select authors (EFAAuthorNames / EFAAuthorIDs)'>
                    <TagPicker
                      onOptionSelect={(_, data) => {
                        const newSelected = allAuthors.filter((a: Author) =>
                          (data.selectedOptions as string[]).includes(a.authorId)
                        );
                        setSelectedAuthors(newSelected);
                        setAuthorSearchText('');
                      }}
                      selectedOptions={selectedAuthors.map(a => a.authorId)}
                      disabled={isLoadingAuthors || isLoading}
                    >
                      <TagPickerControl>
                        <TagPickerGroup>
                          {selectedAuthors.map(author => (
                            <Tag
                              key={author.authorId}
                              value={author.authorId}
                              dismissible
                              dismissIcon={{ 'aria-label': `Remove ${author.fullName}` }}
                              size='small'
                            >
                              {author.fullName}
                            </Tag>
                          ))}
                        </TagPickerGroup>
                        <TagPickerInput
                          value={authorSearchText}
                          onChange={e => setAuthorSearchText(e.target.value)}
                          placeholder={isLoadingAuthors ? 'Loading authors...' : 'Search and select authors'}
                        />
                      </TagPickerControl>
                      <TagPickerList style={{ maxHeight: '240px', overflowY: 'auto' }}>
                        {filteredAuthorsOptions.map((author: Author) => (
                          <TagPickerOption key={author.authorId} value={author.authorId}>
                            {author.fullName}
                          </TagPickerOption>
                        ))}
                      </TagPickerList>
                    </TagPicker>
                  </Field>
                )}

                {/* Company selector */}
                <Field 
                  label='Company' 
                  hint='Select a company for this document (Non-Corporate = EFACorpID: -1)'
                >
                  <Combobox
                    placeholder={
                      isLoadingCompanies
                        ? "Loading companies..."
                        : "Search and select a company"
                    }
                    disabled={isLoadingCompanies || isLoading}
                    value={companySearchText}
                    selectedOptions={[selectedCompany.corpId]}
                    onInput={(e) =>
                      setCompanySearchText((e.target as HTMLInputElement).value)
                    }
                    onOptionSelect={(_, data) => {
                      if (data.optionValue === "-1") {
                        setSelectedCompany(NONE_COMPANY);
                        setCompanySearchText('Non-Corporate');
                      } else {
                        const company = filteredCompanies.find(
                          (c) => c.corpId === data.optionValue,
                        );
                        if (company) {
                          setSelectedCompany(company);
                          setCompanySearchText(company.corpName);
                        }
                      }
                    }}
                    positioning={{ autoSize: false }}
                    listbox={{
                      style: { maxHeight: "240px", overflowY: "auto" },
                    }}
                  >
                    <Option key='none' value='-1' text='Non-Corporate'>
                      Non-corporate
                    </Option>
                    {filteredCompanies.map((company) => (
                      <Option
                        key={company.corpId}
                        value={company.corpId}
                        text={company.corpName}
                      >
                        {company.corpName}
                        {company.shortName &&
                          company.shortName !== company.corpName &&
                          ` (${company.shortName})`}
                      </Option>
                    ))}
                  </Combobox>
                </Field>

                {/* Template selector for PowerPoint files */}
                {isPowerPoint && (
                  <Field 
                    label='Template' 
                    required
                    hint='Select a report template for this presentation'
                  >
                    <Dropdown
                      placeholder={isLoadingTemplates ? 'Loading templates...' : 'Select a template'}
                      disabled={isLoadingTemplates || isLoading}
                      value={workflowTemplates?.find(t => t.TemplateID === selectedTemplateId)?.TemplateName || ''}
                      selectedOptions={selectedTemplateId !== null ? [String(selectedTemplateId)] : []}
                      onOptionSelect={(_, data) => {
                        console.log('[DocumentUploadDialog] Template onOptionSelect — optionValue:', data.optionValue, 'optionText:', data.optionText);
                        const id = parseInt(data.optionValue ?? '', 10);
                        const template = workflowTemplates?.find(t => t.TemplateID === id);
                        console.log('[DocumentUploadDialog] Template found:', template);
                        const newId = isNaN(id) ? null : id;
                        console.log('[DocumentUploadDialog] Setting selectedTemplateId:', newId);
                        setSelectedTemplateId(newId);
                      }}
                    >
                      {workflowTemplates?.filter(t => t.TemplateID === 501).map(template => (
                        <Option key={template.TemplateID} value={String(template.TemplateID)} text={template.TemplateName}>
                          {template.TemplateName}
                          {template.TemplateDescription && ` (${template.TemplateDescription})`}
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>
                )}

                {/* Additional PowerPoint-specific fields */}
                {isPowerPoint && (
                  <>
                    <Field label='Submission Date' required hint='Date submitted (EFALastRefreshDate)'>
                      <Input
                        type='date'
                        value={submissionDate}
                        onChange={(_, data) => setSubmissionDate(data.value)}
                        disabled={isLoading}
                      />
                    </Field>

                    <Field label='Language' hint='Document language (EFALanguageID)'>
                      <Dropdown
                        value={LANGUAGE_MAPPING[selectedLanguageKey as SupportedLanguage]?.label || ''}
                        selectedOptions={[selectedLanguageKey]}
                        onOptionSelect={(_, data) => {
                          if (data.optionValue) setSelectedLanguageKey(data.optionValue);
                        }}
                        disabled={isLoading}
                      >
                        {Object.entries(LANGUAGE_MAPPING).map(([key, config]) => (
                          <Option key={key} value={key} text={config.label}>
                            {config.flag} {config.label}
                          </Option>
                        ))}
                      </Dropdown>
                    </Field>

                    <Field label='Word Template ID' hint='Integer template ID (FDRW_WordID, default: 21)'>
                      <Input
                        type='number'
                        value={fdrwWordID}
                        onChange={(_, data) => setFdrwWordID(data.value)}
                        placeholder='21'
                        disabled={isLoading}
                      />
                    </Field>
                  </>
                )}

                {isLoading && <ProgressBar />}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" disabled={isLoading}>
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              appearance="primary"
              icon={
                isLoading ? (
                  <Spinner size="tiny" />
                ) : success ? (
                  <Checkmark20Filled />
                ) : (
                  <ArrowUpload20Regular />
                )
              }
              onClick={handleUpload}
              disabled={
                (!useCurrentPresentation && !selectedFile) || 
                !docName.trim() || 
                docNameConflict ||
                isLoading || 
                success || 
                (isPowerPoint && selectedAuthors.length === 0) ||
                (isPowerPoint && selectedTemplateId === null)
              }
            >
              {isLoading ? "Uploading..." : success ? "Done" : "Upload"}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

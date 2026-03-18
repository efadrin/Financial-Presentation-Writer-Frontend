import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  makeStyles,
  tokens,
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
} from '@fluentui/react-components';
import {
  ArrowUpload20Regular,
  Checkmark20Filled,
  SlideText20Regular,
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
import { ApiName, AuthorDetails, Common, LANGUAGE_MAPPING, SupportedLanguage } from '@/utils/constants';
import { Company } from '@/interfaces/Company';
import { Author } from '@/interfaces/Author';

// Supported file extensions - PowerPoint only
const SUPPORTED_EXTENSIONS = ['.pptx', '.ppt'];

// Sentinel company representing "no company selected" (EFACorpID: -1)
const NONE_COMPANY: Company = {
  corpId: '-1',
  corpName: 'None',
  shortName: '',
  market: '',
  sector: '',
  model: '',
  securityId: '',
  industry: '',
  annPub: false,
  annUnPub: false,
  userID: '',
  relationshipIds: '',
};

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  uploadArea: {
    border: '2px dashed #ccc',
    borderRadius: '4px',
    padding: '32px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#f5f5f5',
  },
  fileSelected: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
  },
  fileInfo: {
    flex: 1,
  },
});

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export const DocumentUploadDialog: React.FC<DocumentUploadDialogProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
}) => {
  const styles = useStyles();
  const settings = useSelector((state: RootState) => state.settings);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company>(NONE_COMPANY);
  const [companySearchText, setCompanySearchText] = useState('None');
  const [submissionDate, setSubmissionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedLanguageKey, setSelectedLanguageKey] = useState<string>(
    settings.selectedLanguage || 'en'
  );
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [authorSearchText, setAuthorSearchText] = useState('');
  const [fdrwWordID, setFdrwWordID] = useState<string>('38');

  // Get account info for API calls
  const account = settings.account;
  const accountID = account?.AccountID ? parseInt(account.AccountID, 10) : 0;
  const accountName = account?.AccountName || '';
  const userID = account?.UserID ? parseInt(account.UserID, 10) : 0;
  const srvrID = account?.SrvrID ? parseInt(account.SrvrID, 10) : 0;

  // Check if we have required params for company query
  const hasRequiredParams = !!(account?.AccountID && account?.AccountName && account?.SrvrID && account?.UserID);
  const languageId = getCurrentLanguageIdFromSettings(settings);

  // Fetch companies for the user
  const { data: companiesResponse, isLoading: isLoadingCompanies } = useGetCompaniesbyUserQuery(
    {
      SrvrID: account?.SrvrID || '',
      AccountID: account?.AccountID || '',
      LanguageID: languageId,
      UserID: userID,
      AccountName: account?.AccountName || '',
    },
    { skip: !hasRequiredParams }
  );

  // Filter companies based on search text
  const filteredCompanies = useMemo(() => {
    const companies = companiesResponse?.Data && Array.isArray(companiesResponse.Data) 
      ? companiesResponse.Data 
      : [];
    const isShowingSelection = companySearchText === selectedCompany.corpName;
    if (!companySearchText || isShowingSelection) return companies.slice(0, 50);
    const searchLower = companySearchText.toLowerCase();
    return companies
      .filter(c => 
        c.corpName.toLowerCase().includes(searchLower) || 
        c.shortName.toLowerCase().includes(searchLower)
      )
      .slice(0, 50);
  }, [companiesResponse, companySearchText, selectedCompany.corpName]);

  // Fetch all authors for the author selector
  const { data: allAuthorsData, isLoading: isLoadingAuthors } = useGetAuthorsQuery(
    {
      ApiName: ApiName.AnalystCoverageEx,
      AccountName: accountName,
      UserID: '',
      CorpID: '',
      SrvrID: account?.SrvrID || '',
      ListByCorp: Common.LIST_BY_CORP,
    },
    { skip: !accountName || !account?.SrvrID }
  );

  const allAuthors = useMemo<Author[]>(() => {
    if (!allAuthorsData?.Data || !Array.isArray(allAuthorsData.Data)) return [];
    const seen = new Set<string>();
    return allAuthorsData.Data
      .flatMap((corp: { authors?: Author[] }) => corp.authors || [])
      .filter((author: Author) => {
        if (seen.has(author.authorId)) return false;
        seen.add(author.authorId);
        return true;
      })
      .sort((a: Author, b: Author) => (a.fullName ?? '').localeCompare(b.fullName ?? ''));
  }, [allAuthorsData]);

  const filteredAuthorsOptions = useMemo<Author[]>(() => {
    if (!authorSearchText) return allAuthors.slice(0, 50);
    const lower = authorSearchText.toLowerCase();
    return allAuthors.filter((a: Author) => a.fullName.toLowerCase().includes(lower)).slice(0, 50);
  }, [allAuthors, authorSearchText]);

  // Fetch workflow templates
  const { data: workflowFilters, isLoading: isLoadingTemplates } = useGetWorkflowFiltersQuery(
    { AccountName: accountName, SrvrID: srvrID },
    { skip: !accountName || !srvrID }
  );
  
  const workflowTemplates = workflowFilters?.Data?.Templates || [];

  // API mutations
  const [getDocID] = useGetDocIDMutation();
  const [submitReportToEFA] = useSubmitReportToEFAMutation();

  const handleFileSelect = useCallback((file: File) => {
    const fileName = file.name.toLowerCase();
    const isSupported = SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (isSupported) {
      setSelectedFile(file);
      setDocName(file.name.replace(/\.(pptx?|ppt)$/i, ''));
      setError(null);
      setSelectedTemplateId(null);
    } else {
      setError('Please select a PowerPoint presentation (.pptx, .ppt)');
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
    [handleFileSelect]
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
    [handleFileSelect]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !docName.trim()) {
      setError('Please select a file and provide a document name');
      return;
    }

    if (!selectedTemplateId) {
      setError('Please select a template for PowerPoint presentations');
      return;
    }

    if (!accountID || !userID || !accountName) {
      setError('Account information not available. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert file to base64
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1] || result;
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(selectedFile);
      });

      // Prepare document name with extension
      const fileExtension = selectedFile.name.split('.').pop() || '';
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
        throw new Error('Failed to generate document ID');
      }

      const newDocID = docIdResponse.Data.DocID;

      // Build DocVariables
      const docVariables: { Name: string; Value: string }[] = [];
      
      docVariables.push({ Name: 'FDRW_Account', Value: accountName });
      docVariables.push({ Name: 'EFAAccountID', Value: accountID.toString() });
      docVariables.push({ Name: 'EFADocID', Value: newDocID.toString() });
      docVariables.push({ Name: 'EFACorpID', Value: selectedCompany.corpId });
      
      // Template and presentation-specific variables
      if (selectedTemplateId) {
        docVariables.push({ Name: 'EFATemplateID', Value: selectedTemplateId.toString() });
      }
      docVariables.push({ Name: 'FDRW_WordID', Value: fdrwWordID || '38' });
      
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

      // Call submitReportToEFA API
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
        throw new Error(saveResponse?.Message || 'Failed to save document');
      }

      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        onUploadComplete?.();
        // Reset state
        setSelectedFile(null);
        setDocName('');
        setSuccess(false);
        setIsLoading(false);
        setSelectedTemplateId(null);
        setSelectedCompany(NONE_COMPANY);
        setCompanySearchText('None');
        setSubmissionDate(new Date().toISOString().split('T')[0]);
        setSelectedLanguageKey(settings.selectedLanguage || 'en');
        setSelectedAuthors([]);
        setAuthorSearchText('');
        setFdrwWordID('38');
      }, 1500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [
    selectedFile, 
    docName, 
    selectedCompany, 
    accountID, 
    accountName, 
    userID, 
    srvrID, 
    onOpenChange, 
    onUploadComplete, 
    selectedTemplateId,
    getDocID,
    submitReportToEFA,
    submissionDate,
    selectedLanguageKey,
    selectedAuthors,
    fdrwWordID,
    settings.selectedLanguage,
  ]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onOpenChange(false);
      setSelectedFile(null);
      setDocName('');
      setError(null);
      setSuccess(false);
      setSelectedTemplateId(null);
      setSelectedCompany(NONE_COMPANY);
      setCompanySearchText('None');
      setSubmissionDate(new Date().toISOString().split('T')[0]);
      setSelectedLanguageKey(settings.selectedLanguage || 'en');
      setSelectedAuthors([]);
      setAuthorSearchText('');
      setFdrwWordID('38');
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
          <DialogTitle>Upload Presentation to Drafts</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {success ? (
              <MessageBar intent='success'>
                <MessageBarBody>
                  <MessageBarTitle>Success!</MessageBarTitle>
                  Presentation uploaded successfully to Drafts.
                </MessageBarBody>
              </MessageBar>
            ) : (
              <>
                {error && (
                  <MessageBar intent='error'>
                    <MessageBarBody>
                      <MessageBarTitle>Error</MessageBarTitle>
                      {error}
                    </MessageBarBody>
                  </MessageBar>
                )}

                {!selectedFile ? (
                  <label>
                    <div
                      className={styles.uploadArea}
                      style={isDragging ? { borderColor: '#0078d4', backgroundColor: '#f0f6fc' } : undefined}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <ArrowUpload20Regular />
                      </div>
                      <div style={{ marginBottom: '8px' }}>
                        Drag and drop a PowerPoint presentation here
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        or click to browse (.pptx, .ppt)
                      </div>
                    </div>
                    <input
                      type='file'
                      accept='.pptx,.ppt'
                      style={{ display: 'none' }}
                      onChange={handleFileInputChange}
                    />
                  </label>
                ) : (
                  <div className={styles.fileSelected}>
                    <SlideText20Regular />
                    <div className={styles.fileInfo}>
                      <div style={{ fontWeight: 600 }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatFileSize(selectedFile.size)} (PowerPoint)
                      </div>
                    </div>
                    <Button
                      appearance='subtle'
                      size='small'
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedTemplateId(null);
                        setSelectedCompany(NONE_COMPANY);
                        setCompanySearchText('None');
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                {/* Company selector */}
                <Field 
                  label='Company' 
                  hint='Select a company for this document (None = EFACorpID: -1)'
                >
                  <Combobox
                    placeholder={isLoadingCompanies ? 'Loading companies...' : 'Search and select a company'}
                    disabled={isLoadingCompanies || isLoading}
                    value={companySearchText}
                    selectedOptions={[selectedCompany.corpId]}
                    onInput={(e) => setCompanySearchText((e.target as HTMLInputElement).value)}
                    onOptionSelect={(_, data) => {
                      if (data.optionValue === '-1') {
                        setSelectedCompany(NONE_COMPANY);
                        setCompanySearchText('None');
                      } else {
                        const company = filteredCompanies.find(c => c.corpId === data.optionValue);
                        if (company) {
                          setSelectedCompany(company);
                          setCompanySearchText(company.corpName);
                        }
                      }
                    }}
                    positioning={{ autoSize: false }}
                    listbox={{ style: { maxHeight: '240px', overflowY: 'auto' } }}
                  >
                    <Option key='none' value='-1' text='None'>
                      None
                    </Option>
                    {filteredCompanies.map(company => (
                      <Option key={company.corpId} value={company.corpId} text={company.corpName}>
                        {company.corpName}
                        {company.shortName && company.shortName !== company.corpName && ` (${company.shortName})`}
                      </Option>
                    ))}
                  </Combobox>
                </Field>

                {/* Template selector */}
                <Field 
                  label='Template' 
                  required
                  hint='Select a report template for this presentation'
                >
                  <Dropdown
                    placeholder={isLoadingTemplates ? 'Loading templates...' : 'Select a template'}
                    disabled={isLoadingTemplates || isLoading}
                    value={workflowTemplates?.find(t => t.TemplateID === selectedTemplateId)?.TemplateName || ''}
                    onOptionSelect={(_, data) => {
                      const template = workflowTemplates?.find(t => t.TemplateName === data.optionValue);
                      setSelectedTemplateId(template?.TemplateID || null);
                    }}
                  >
                    {workflowTemplates?.map(template => (
                      <Option key={template.TemplateID} value={template.TemplateName} text={template.TemplateName}>
                        {template.TemplateName}
                        {template.TemplateDescription && ` (${template.TemplateDescription})`}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>

                {/* Submission Date */}
                <Field label='Submission Date' required hint='Date submitted (EFALastRefreshDate)'>
                  <Input
                    type='date'
                    value={submissionDate}
                    onChange={(_, data) => setSubmissionDate(data.value)}
                    disabled={isLoading}
                  />
                </Field>

                {/* Language */}
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

                {/* Authors */}
                <Field label='Authors' hint='Select authors (EFAAuthorNames / EFAAuthorIDs)'>
                  <Combobox
                    multiselect
                    placeholder={isLoadingAuthors ? 'Loading authors...' : 'Search and select authors'}
                    disabled={isLoadingAuthors || isLoading}
                    selectedOptions={selectedAuthors.map(a => a.authorId)}
                    onInput={(e) => setAuthorSearchText((e.target as HTMLInputElement).value)}
                    onOptionSelect={(_, data) => {
                      const newSelected = allAuthors.filter((a: Author) =>
                        (data.selectedOptions as string[]).includes(a.authorId)
                      );
                      setSelectedAuthors(newSelected);
                      setAuthorSearchText('');
                    }}
                    positioning={{ autoSize: false }}
                    listbox={{ style: { maxHeight: '240px', overflowY: 'auto' } }}
                  >
                    {filteredAuthorsOptions.map((author: Author) => (
                      <Option key={author.authorId} value={author.authorId} text={author.fullName}>
                        {author.fullName}
                      </Option>
                    ))}
                  </Combobox>
                </Field>

                {/* Word Template ID */}
                <Field label='Word Template ID' hint='Integer template ID (FDRW_WordID, default: 38)'>
                  <Input
                    type='number'
                    value={fdrwWordID}
                    onChange={(_, data) => setFdrwWordID(data.value)}
                    placeholder='38'
                    disabled={isLoading}
                  />
                </Field>

                <Field label='Document Name' required>
                  <Input
                    value={docName}
                    onChange={(_, data) => setDocName(data.value)}
                    placeholder='Enter presentation name'
                    disabled={isLoading}
                  />
                </Field>

                {isLoading && <ProgressBar />}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance='secondary' disabled={isLoading}>
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              appearance='primary'
              icon={isLoading ? <Spinner size='tiny' /> : success ? <Checkmark20Filled /> : <ArrowUpload20Regular />}
              onClick={handleUpload}
              disabled={
                !selectedFile || 
                !docName.trim() || 
                isLoading || 
                success || 
                !selectedTemplateId
              }
            >
              {isLoading ? 'Uploading...' : success ? 'Done' : 'Upload'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

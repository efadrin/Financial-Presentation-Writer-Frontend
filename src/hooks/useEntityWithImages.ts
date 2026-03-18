/**
 * Hooks for fetching entity data with images merged from separate cached sources.
 *
 * These hooks implement a caching strategy where:
 * - Entity data (companies, templates, authors) is always fetched fresh (no caching)
 * - Images are cached separately in IndexedDB for 30 days (since they rarely change)
 * - Components receive entity data with images automatically merged
 */

import { useMemo } from 'react';
import { Company, CompaniesbyUser } from '@/interfaces/Company';
import { ReportType, UseReportTypes } from '@/interfaces/ReportType';
import { UseAuthors, AuthorsResponse, Author } from '@/interfaces/Author';
import { AuthorAvatarRequest } from '@/interfaces/AuthorImage';
import {
  useGetCompaniesbyUserQuery,
  useGetCompanyImagesQuery,
  useGetReportTemplatesQuery,
  useGetReportTemplateImagesQuery,
  useGetAuthorsQuery,
  useGetAuthorAvatarsQuery,
  CompanyImagesRequest,
  ReportTemplateImagesRequest,
} from '@/services/apiSlice';

// Extended Author interface with avatar
export interface AuthorWithAvatar extends Author {
  authorAvatar?: string;
}

/**
 * Hook to get companies with images merged from separate cached image data.
 * - Company data is fetched fresh every time
 * - Images are cached in IndexedDB for 30 days
 */
export const useCompaniesWithImages = (
  params: CompaniesbyUser,
  options?: { skip?: boolean }
) => {
  const shouldSkip = options?.skip ?? false;

  // Fetch fresh company data (no IndexedDB caching)
  const companiesResult = useGetCompaniesbyUserQuery(params, {
    skip: shouldSkip,
  });

  // Build image request params
  const imageParams: CompanyImagesRequest = useMemo(
    () => ({
      accountID: parseInt(params.AccountID, 10) || 0,
      accountName: params.AccountName,
      srvrID: parseInt(params.SrvrID, 10) || 0,
      userID: params.UserID,
      languageID: parseInt(params.LanguageID || '0', 10) || 0,
    }),
    [params]
  );

  // Fetch images (cached in IndexedDB for 30 days)
  const imagesResult = useGetCompanyImagesQuery(imageParams, {
    skip: shouldSkip || !params.AccountName,
  });

  // Merge companies with their cached images
  const companiesWithImages = useMemo(() => {
    const companies = companiesResult.data?.Data;
    const images = imagesResult.data?.Data?.Images;

    if (!companies || !Array.isArray(companies)) {
      return [];
    }

    if (!images) {
      return companies;
    }

    return companies.map((company) => ({
      ...company,
      companyImage:
        images[parseInt(company.corpId, 10)] || company.companyImage || '',
    }));
  }, [companiesResult.data?.Data, imagesResult.data?.Data?.Images]);

  return {
    ...companiesResult,
    data: companiesResult.data
      ? {
          ...companiesResult.data,
          Data: companiesWithImages,
        }
      : undefined,
    // Expose image loading state separately if needed
    isImagesLoading: imagesResult.isFetching,
    isImagesError: imagesResult.isError,
  };
};

/**
 * Hook to get report templates with images merged from separate cached image data.
 * - Template data is fetched fresh every time
 * - Images are cached in IndexedDB for 30 days
 */
export const useReportTemplatesWithImages = (
  params: UseReportTypes,
  options?: { skip?: boolean }
) => {
  const shouldSkip = options?.skip ?? false;

  // Fetch fresh template data (no IndexedDB caching)
  const templatesResult = useGetReportTemplatesQuery(params, {
    skip: shouldSkip,
  });

  // Build image request params
  const imageParams: ReportTemplateImagesRequest = useMemo(
    () => ({
      FirmID: parseInt(params.FirmID, 10) || 0,
    }),
    [params.FirmID]
  );

  // Fetch images (cached in IndexedDB for 30 days)
  const imagesResult = useGetReportTemplateImagesQuery(imageParams, {
    skip: shouldSkip || !params.FirmID,
  });

  // Merge templates with their cached images
  const templatesWithImages = useMemo(() => {
    const templates = templatesResult.data?.Data;
    const images = imagesResult.data?.Data?.Images;

    if (!templates || !Array.isArray(templates)) {
      return [];
    }

    if (!images) {
      return templates;
    }

    return templates.map((template) => ({
      ...template,
      RprtImg:
        images[
          typeof template.WordID === 'string'
            ? parseInt(template.WordID, 10)
            : template.WordID
        ] ||
        template.RprtImg ||
        '',
    }));
  }, [templatesResult.data?.Data, imagesResult.data?.Data?.Images]);

  return {
    ...templatesResult,
    data: templatesResult.data
      ? {
          ...templatesResult.data,
          Data: templatesWithImages,
        }
      : undefined,
    // Expose image loading state separately if needed
    isImagesLoading: imagesResult.isFetching,
    isImagesError: imagesResult.isError,
  };
};

/**
 * Hook to get authors with avatars merged from separate cached image data.
 * - Author data is fetched fresh every time
 * - Avatars are cached in IndexedDB for 30 days
 */
export const useAuthorsWithImages = (
  params: UseAuthors,
  options?: { skip?: boolean }
) => {
  const shouldSkip = options?.skip ?? false;

  // Fetch fresh author data (no IndexedDB caching)
  const authorsResult = useGetAuthorsQuery(params, {
    skip: shouldSkip,
  });

  // Build avatar request params
  const avatarParams: AuthorAvatarRequest = useMemo(
    () => ({
      SrvrID: params.SrvrID,
    }),
    [params.SrvrID]
  );

  // Fetch avatars (cached in IndexedDB for 30 days)
  const avatarsResult = useGetAuthorAvatarsQuery(avatarParams, {
    skip: shouldSkip || !params.SrvrID,
  });

  // Build avatar map for quick lookup
  const avatarMap = useMemo(() => {
    const map = new Map<string, string>();
    const avatars = avatarsResult.data?.Data;

    if (avatars && Array.isArray(avatars)) {
      avatars.forEach((avatar) => {
        if (avatar.authorId && avatar.authorAvatar) {
          map.set(avatar.authorId, avatar.authorAvatar);
        }
      });
    }

    return map;
  }, [avatarsResult.data?.Data]);

  // Merge authors with their cached avatars
  const authorsWithAvatars = useMemo(() => {
    const data = authorsResult.data?.Data;

    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((corpGroup) => ({
      ...corpGroup,
      authors: corpGroup.authors.map((author) => ({
        ...author,
        authorAvatar: avatarMap.get(author.authorId) || '',
      })) as AuthorWithAvatar[],
    }));
  }, [authorsResult.data?.Data, avatarMap]);

  return {
    ...authorsResult,
    data: authorsResult.data
      ? {
          ...authorsResult.data,
          Data: authorsWithAvatars,
        }
      : undefined,
    // Expose avatar loading state separately if needed
    isAvatarsLoading: avatarsResult.isFetching,
    isAvatarsError: avatarsResult.isError,
  };
};

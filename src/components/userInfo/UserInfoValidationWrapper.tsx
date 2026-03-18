import {
  useCreateUserMutation,
  useLazyGetUserInfoQuery,
} from '@/services/apiSlice';
import { pruneAllSettings, setUserInfo } from '@/services/settingSlice';
import { RootState, useAppDispatch } from '@/store';
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import RenderWhen from '@/components/common/RenderWhen';
import { FullPageCenter } from '../common/FullPageCenter';
import AppSkeleton from '../common/AppSkeleton';

export const UserInfoValidationWrapper: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  const dispatch = useAppDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const [createUser, { isError: isCreateUserError }] = useCreateUserMutation();

  const [triggerGetUserInfo, { isError: isGetUserInfoError }] =
    useLazyGetUserInfoQuery();

  const [isValidationDone, setIsValidationDone] = useState<boolean>(false);
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    if (!isFirstRender.current) return;
    isFirstRender.current = false;

    const run = async () => {
      try {
        if (settings.userInfo.isRegistered) {
          const userInfo = await triggerGetUserInfo().unwrap();

          if (userInfo?.Data) {
            if (userInfo.Data.Email !== settings.userInfo.Email) {
              dispatch(pruneAllSettings());
            }

            dispatch(
              setUserInfo({
                Email: userInfo.Data.Email,
                FirmID: userInfo.Data.FirmID,
                FirmKey: userInfo.Data.FirmKey,
                isRegistered: true,
              })
            );
          }
        } else {
          await createUser().unwrap();

          const userInfo = await triggerGetUserInfo().unwrap();

          if (userInfo?.Data) {
            dispatch(
              setUserInfo({
                Email: userInfo.Data.Email,
                FirmID: userInfo.Data.FirmID,
                FirmKey: userInfo.Data.FirmKey,
                isRegistered: true,
              })
            );
          }
        }

        setIsValidationDone(true);
      } catch (error) {
        console.error('Error during user validation:', error);
        setIsValidationDone(true);
      }
    };

    run();
  }, [
    settings.userInfo.isRegistered,
    settings.userInfo.Email,
    triggerGetUserInfo,
    createUser,
    dispatch,
  ]);

  if (!isValidationDone)
    return (
      <RenderWhen
        condition={isCreateUserError || isGetUserInfoError}
        fallback={<AppSkeleton message='Validating user...' />}
      >
        <FullPageCenter>
          Failed to validate user. Please try again
        </FullPageCenter>
      </RenderWhen>
    );

  return children;
};

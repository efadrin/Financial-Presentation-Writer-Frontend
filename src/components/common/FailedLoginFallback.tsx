import React, { useEffect, useRef, useState } from 'react';
import { RootState } from '@/store';
import { Button } from '@fluentui/react-components';
import { useSelector } from 'react-redux';
import RenderWhen from './RenderWhen';

const ONE_MINUTE = 60 * 1000;

const FailedLoginFallback = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [remainingSecond, setRemainingSecond] = useState<number | null>(null);
  const counterRef = useRef<NodeJS.Timeout | null>(null);

  const handleLoginButtonClick = () => {
    window.location.reload();
  };

  useEffect(() => {
    if (auth.lastLogin == null || isButtonDisabled) return;
    const timeSinceLastLogin = new Date().getTime() - new Date(auth.lastLogin).getTime();

    if (timeSinceLastLogin < ONE_MINUTE) {
      setIsButtonDisabled(true);
      const remainingSeconds = Math.floor(
        (ONE_MINUTE - timeSinceLastLogin) / 1000
      );
      setRemainingSecond(remainingSeconds);
      counterRef.current = setInterval(() => {
        setRemainingSecond((prev) => Number(prev) - 1);
      }, 1000);
    }
  }, [auth.lastLogin, isButtonDisabled]);

  useEffect(() => {
    if (remainingSecond == null || remainingSecond > 0) return;
    setIsButtonDisabled(false);
    if (counterRef.current) clearInterval(counterRef.current);
  }, [remainingSecond]);

  useEffect(() => {
    return () => {
      if (counterRef.current) clearInterval(counterRef.current);
    };
  }, []);

  return (
    <>
      <RenderWhen
        condition={!isButtonDisabled}
        fallback={
          <p>
            Too many login attempts <br />
            Please try again after {remainingSecond}s
          </p>
        }
      >
        <p>Please login to your microsoft account to continue.</p>
      </RenderWhen>
      <Button
        appearance='primary'
        onClick={handleLoginButtonClick}
        disabled={isButtonDisabled}
      >
        Login
      </Button>
    </>
  );
};

export default FailedLoginFallback;

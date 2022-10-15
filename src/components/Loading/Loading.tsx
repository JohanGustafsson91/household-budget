import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import styled from "styled-components";

export const Loading = ({
  children,
  fullPage = false,
  delay = 1000,
}: PropsWithChildren<{ fullPage?: boolean; delay?: number }>) => {
  const [loadingVisible, setLoadingVisible] = useState(false);
  const timeRef = useRef<NodeJS.Timeout>();

  useEffect(
    function showLoaderAfterTime() {
      timeRef.current = setTimeout(function show() {
        setLoadingVisible(true);
      }, delay);

      return () => timeRef.current && clearTimeout(timeRef.current);
    },
    [delay]
  );

  if (!loadingVisible) {
    return null;
  }

  return fullPage ? <Wrapper>{children}</Wrapper> : <>{children}</>;
};

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

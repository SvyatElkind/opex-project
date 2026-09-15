import React from 'react';
import { useAppVersion } from '../../hooks/useAppVersion';
import { APP_VERSION_UI } from '../../Constants/Constants';

/**
 * One-line strip under the Settings header showing the backend's version
 * ("Versija 1.1 · Beta · 2026.09.09"). Data comes from GET /api/v1/version/;
 * an older backend without that endpoint gets the "unavailable" text.
 */
export const formatAppVersion = (info) =>
  [info?.version, info?.status, info?.date]
    .filter(Boolean)
    .join(APP_VERSION_UI.SEPARATOR);

const AppVersion = () => {
  const { data, isPending, isError } = useAppVersion();

  let text;
  if (isPending) {
    text = APP_VERSION_UI.LOADING;
  } else if (isError || !data?.version) {
    text = APP_VERSION_UI.UNAVAILABLE;
  } else {
    text = `${APP_VERSION_UI.LABEL} ${formatAppVersion(data)}`;
  }

  return (
    <div className="settings-version" data-testid="settings-version">
      <i className="fas fa-info-circle" aria-hidden="true"></i>
      <span>{text}</span>
    </div>
  );
};

export default AppVersion;

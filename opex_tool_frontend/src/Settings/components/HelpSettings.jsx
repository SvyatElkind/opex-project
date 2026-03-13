import React from 'react';

const HelpSettings = () => {
  const openHelp = () => {
    const helpPath = `${window.location.origin}/help.html`;
    window.open(helpPath, 'OPEX_Help', 'width=1200,height=800,resizable=yes,scrollbars=yes');
  };

  return (
    <div className="settings-section">
      <h3>Palīdzība un Atbalsts</h3>

      <div className="help-section">
        <div className="help-item">
          <i className="fas fa-book"></i>
          <div>
            <h4>Lietotāja Rokasgrāmata</h4>
            <p>Pilna dokumentācija par OPEX rīka izmantošanu</p>
            <button onClick={openHelp} className="help-btn">
              Atvērt Rokasgrāmatu
            </button>
          </div>
        </div>

        <div className="help-item">
          <i className="fas fa-video"></i>
          <div>
            <h4>Video Pamācības</h4>
            <p>Vizuālas pamācības par galvenajām funkcijām</p>
            <button className="help-btn" disabled>
              Drīzumā
            </button>
          </div>
        </div>

        <div className="help-item">
          <i className="fas fa-question-circle"></i>
          <div>
            <h4>Bieži Uzdotie Jautājumi</h4>
            <p>Atbildes uz visbiežāk uzdotajiem jautājumiem</p>
            <button className="help-btn" disabled>
              Drīzumā
            </button>
          </div>
        </div>

        <div className="help-item">
          <i className="fas fa-envelope"></i>
          <div>
            <h4>Tehniskais Atbalsts</h4>
            <p>Sazinieties ar mums, ja jums ir jautājumi vai problēmas</p>
            <button
              className="help-btn"
              onClick={() => window.location.href = 'mailto:support@opex.lv'}
            >
              Sūtīt E-pastu
            </button>
          </div>
        </div>
      </div>

      <div className="settings-divider"></div>

      <div className="version-info">
        <h4>Versijas Informācija</h4>
        <table className="version-table">
          <tbody>
            <tr>
              <td>OPEX Rīks Versija:</td>
              <td><strong>2.0.0</strong></td>
            </tr>
            <tr>
              <td>Pēdējais Atjauninājums:</td>
              <td>2026-01-17</td>
            </tr>
            <tr>
              <td>Licence:</td>
              <td>Komerciāla</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="settings-divider"></div>

      <div className="about-section">
        <h4>Par OPEX Rīku</h4>
        <p>
          OPEX (Open Preservation Exchange) rīks ir paredzēts elektronisko dokumentu
          un arhīvu pārvaldībai un apmaiņai atbilstoši starptautiskajiem standartiem.
        </p>
        <p>
          <strong>© 2026 OPEX Project.</strong> Visas tiesības aizsargātas.
        </p>
      </div>
    </div>
  );
};

export default HelpSettings;

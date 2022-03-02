/**
 * Copyright (c) 2022, Diabeloop
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { errorTextFromException } from "../../lib/utils";
import { useAuth } from "../../lib/auth";
import { useAlert } from "../../components/utils/snackbar";
import LoadingBackdrop from "../../components/utils/loading-backdrop";

function CertifyAccountPage(): JSX.Element {
  const { search } = useLocation();
  const { certifyProfessionalAccount } = useAuth();
  const { t } = useTranslation("yourloops");
  const alert = useAlert();
  const history = useHistory();

  const [processing, setProcessing] = useState(false);
  const sourceUrl = new URLSearchParams(search).get("source");
  const frProId = new URLSearchParams(search).get("frproid");
  const error = new URLSearchParams(search).get("error");

  const certify = async () => {
    try {
      setProcessing(true);
      if (error) {
        alert.error(t("error-http-500"));
        return;
      }
      if (sourceUrl === "psc" && frProId) {
        await certifyProfessionalAccount();
        alert.success(t("certify-professional-account-done"));
      }
    } catch (err) {
      alert.error(errorTextFromException(err));
    } finally {
      setProcessing(false);
      history.push("/professional/preferences");
    }
  };

  useEffect(() => {
    certify();
    // We just need to call this async function once when the component is mounted, after that there's a redirection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LoadingBackdrop open={processing} />
  );
}

export default CertifyAccountPage;

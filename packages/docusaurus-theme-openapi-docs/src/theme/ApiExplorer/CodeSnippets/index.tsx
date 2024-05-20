/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState, useEffect } from "react";

import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import codegen from "@paloaltonetworks/postman-code-generators";
import sdk from "@paloaltonetworks/postman-collection";
import ApiCodeBlock from "@theme/ApiExplorer/ApiCodeBlock";
import buildPostmanRequest from "@theme/ApiExplorer/buildPostmanRequest";
import CodeTabs from "@theme/ApiExplorer/CodeTabs";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import merge from "lodash/merge";

import { CodeSample, Language } from "./code-snippets-types";
import {
  getCodeSampleSourceFromLanguage,
  mergeCodeSampleLanguage,
} from "./languages";

export const languageSet: Language[] = [
  {
    highlight: "bash",
    language: "curl",
    codeSampleLanguage: "Shell",
    logoClass: "bash",
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
    variants: ["curl"],
  },
  {
    highlight: "python",
    language: "python",
    codeSampleLanguage: "Python",
    logoClass: "python",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "requests",
    variants: ["requests", "http.client"],
  },
  {
    highlight: "go",
    language: "go",
    codeSampleLanguage: "Go",
    logoClass: "go",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "native",
    variants: ["native"],
  },
  {
    highlight: "javascript",
    language: "nodejs",
    codeSampleLanguage: "JavaScript",
    logoClass: "nodejs",
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "axios",
    variants: ["axios", "native"],
  },
  {
    highlight: "ruby",
    language: "ruby",
    codeSampleLanguage: "Ruby",
    logoClass: "ruby",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "Net::HTTP",
    variants: ["net::http"],
  },
  {
    highlight: "csharp",
    language: "csharp",
    codeSampleLanguage: "C#",
    logoClass: "csharp",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestSharp",
    variants: ["restsharp", "httpclient"],
  },
  {
    highlight: "php",
    language: "php",
    codeSampleLanguage: "PHP",
    logoClass: "php",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "cURL",
    variants: ["curl", "guzzle", "pecl_http", "http_request2"],
  },
  {
    highlight: "java",
    language: "java",
    codeSampleLanguage: "Java",
    logoClass: "java",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "OkHttp",
    variants: ["okhttp", "unirest"],
  },
  {
    highlight: "powershell",
    language: "powershell",
    codeSampleLanguage: "PowerShell",
    logoClass: "powershell",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
    variant: "RestMethod",
    variants: ["restmethod"],
  },
];

export interface Props {
  postman: sdk.Request;
  codeSamples: CodeSample[];
}

function CodeTab({ children, hidden, className }: any): JSX.Element {
  return (
    <div role="tabpanel" className={className} {...{ hidden }}>
      {children}
    </div>
  );
}

function CodeSnippets({ postman, codeSamples }: Props) {
  // TODO: match theme for vscode.

  const { siteConfig } = useDocusaurusContext();

  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const server = useTypedSelector((state: any) => state.server.value);
  const body = useTypedSelector((state: any) => state.body);

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);

  const auth = useTypedSelector((state: any) => state.auth);

  // User-defined languages array
  // Can override languageSet, change order of langs, override options and variants
  const langs = [
    ...((siteConfig?.themeConfig?.languageTabs as Language[] | undefined) ??
      languageSet),
  ];

  // Filter languageSet by user-defined langs
  const filteredLanguageSet = languageSet.filter((ls) => {
    return langs.some((lang) => {
      return lang.language === ls.language;
    });
  });

  // Merge user-defined langs into languageSet
  const mergedLangs = mergeCodeSampleLanguage(
    merge(filteredLanguageSet, langs),
    codeSamples
  );

  // Read defaultLang from localStorage
  const defaultLang: Language[] = mergedLangs.filter(
    (lang) =>
      lang.language === localStorage.getItem("docusaurus.tab.code-samples")
  );
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const [selectedSample, setSelectedSample] = useState<string | undefined>();
  const [language, setLanguage] = useState(() => {
    // Return first index if only 1 user-defined language exists
    if (mergedLangs.length === 1) {
      return mergedLangs[0];
    }
    // Fall back to language in localStorage or first user-defined language
    return defaultLang[0] ?? mergedLangs[0];
  });
  const [codeText, setCodeText] = useState<string>("");
  const [codeSampleCodeText, setCodeSampleCodeText] = useState<
    string | (() => string)
  >(() => getCodeSampleSourceFromLanguage(language));

  useEffect(() => {
    if (language && !!language.sample) {
      setCodeSampleCodeText(getCodeSampleSourceFromLanguage(language));
    }

    if (language && !!language.options) {
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });
      codegen.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else if (language && !language.options) {
      const langSource = mergedLangs.filter(
        (lang) => lang.language === language.language
      );

      // Merges user-defined language with default languageSet
      // This allows users to define only the minimal properties necessary in languageTabs
      // User-defined properties should override languageSet properties
      const mergedLanguage = { ...langSource[0], ...language };
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });

      codegen.convert(
        mergedLanguage.language,
        mergedLanguage.variant,
        postmanRequest,
        mergedLanguage.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    } else {
      setCodeText("");
    }
  }, [
    accept,
    body,
    contentType,
    cookieParams,
    headerParams,
    language,
    pathParams,
    postman,
    queryParams,
    server,
    auth,
    mergedLangs,
  ]);
  // no dependencies was intentionlly set for this particular hook. it's safe as long as if conditions are set
  useEffect(function onSelectedVariantUpdate() {
    if (selectedVariant && selectedVariant !== language.variant) {
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        server,
        auth,
      });
      codegen.convert(
        language.language,
        selectedVariant,
        postmanRequest,
        language.options,
        (error: any, snippet: string) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    }
  });

  // no dependencies was intentionlly set for this particular hook. it's safe as long as if conditions are set
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(function onSelectedSampleUpdate() {
    if (
      language.samples &&
      language.samplesSources &&
      selectedSample &&
      selectedSample !== language.sample
    ) {
      const sampleIndex = language.samples.findIndex(
        (smp) => smp === selectedSample
      );
      setCodeSampleCodeText(language.samplesSources[sampleIndex]);
    }
  });

  if (language === undefined) {
    return null;
  }

  return (
    <>
      <CodeTabs
        groupId="code-samples"
        action={{
          setLanguage: setLanguage,
          setSelectedVariant: setSelectedVariant,
          setSelectedSample: setSelectedSample,
        }}
        languageSet={mergedLangs}
        lazy
      >
        {mergedLangs.map((lang) => {
          return (
            <CodeTab
              value={lang.language}
              label={lang.language}
              key={lang.language}
              attributes={{
                className: `openapi-tabs__code-item--${lang.logoClass}`,
              }}
            >
              {lang.samples && (
                <CodeTabs
                  className="openapi-tabs__code-container-inner"
                  action={{
                    setLanguage: setLanguage,
                    setSelectedSample: setSelectedSample,
                  }}
                  includeSample={true}
                  currentLanguage={lang.language}
                  defaultValue={selectedSample}
                  languageSet={mergedLangs}
                  lazy
                >
                  {lang.samples.map((sample, index) => {
                    return (
                      <CodeTab
                        value={sample}
                        label={
                          lang.samplesLabels
                            ? lang.samplesLabels[index]
                            : sample
                        }
                        key={`${lang.language}-${lang.sample}`}
                        attributes={{
                          className: `openapi-tabs__code-item--sample`,
                        }}
                      >
                        {/* @ts-ignore */}
                        <ApiCodeBlock
                          language={lang.highlight}
                          className="openapi-explorer__code-block"
                          showLineNumbers={true}
                        >
                          {codeSampleCodeText}
                        </ApiCodeBlock>
                      </CodeTab>
                    );
                  })}
                </CodeTabs>
              )}

              <CodeTabs
                className="openapi-tabs__code-container-inner"
                action={{
                  setLanguage: setLanguage,
                  setSelectedVariant: setSelectedVariant,
                }}
                includeVariant={true}
                currentLanguage={lang.language}
                defaultValue={selectedVariant}
                languageSet={mergedLangs}
                lazy
              >
                {lang.variants.map((variant, index) => {
                  return (
                    <CodeTab
                      value={variant.toLowerCase()}
                      label={variant.toUpperCase()}
                      key={`${lang.language}-${lang.variant}`}
                      attributes={{
                        className: `openapi-tabs__code-item--variant`,
                      }}
                    >
                      {/* @ts-ignore */}
                      <ApiCodeBlock
                        language={lang.highlight}
                        className="openapi-explorer__code-block"
                        showLineNumbers={true}
                      >
                        {codeText}
                      </ApiCodeBlock>
                    </CodeTab>
                  );
                })}
              </CodeTabs>
            </CodeTab>
          );
        })}
      </CodeTabs>
    </>
  );
}

export default CodeSnippets;

/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { createAuthentication } from "./createAuthentication";
import { createAuthorization } from "./createAuthorization";
import { createCallbacks } from "./createCallbacks";
import { createContactInfo } from "./createContactInfo";
import { createDeprecationNotice } from "./createDeprecationNotice";
import { createDescription } from "./createDescription";
import { createDownload } from "./createDownload";
import { createHeading } from "./createHeading";
import { createLicense } from "./createLicense";
import { createLogo } from "./createLogo";
import { createMethodEndpoint } from "./createMethodEndpoint";
import { createParamsDetails } from "./createParamsDetails";
import { createRequestBodyDetails } from "./createRequestBodyDetails";
import { createRequestHeader } from "./createRequestHeader";
import { createNodes } from "./createSchema";
import { createStatusCodes } from "./createStatusCodes";
import { createTermsOfService } from "./createTermsOfService";
import { createVendorExtensions } from "./createVendorExtensions";
import { createVersionBadge } from "./createVersionBadge";
import { create, greaterThan, lessThan, render } from "./utils";
import {
  ContactObject,
  LicenseObject,
  MediaTypeObject,
  SecuritySchemeObject,
} from "../openapi/types";
import {
  ApiPageMetadata,
  InfoPageMetadata,
  SchemaPageMetadata,
  TagPageMetadata,
} from "../types";

interface RequestBodyProps {
  title: string;
  body: {
    content?: {
      [key: string]: MediaTypeObject;
    };
    description?: string;
    required?: boolean;
  };
}

export function createApiPageMD({
  title,
  api: {
    deprecated,
    "x-deprecated-description": deprecatedDescription,
    description,
    method,
    path,
    extensions,
    parameters,
    requestBody,
    responses,
    callbacks,
  },
  infoPath,
  frontMatter,
}: ApiPageMetadata) {
  return render([
    `import ApiTabs from "@theme/ApiTabs";\n`,
    `import DiscriminatorTabs from "@theme/DiscriminatorTabs";\n`,
    `import MethodEndpoint from "@theme/ApiExplorer/MethodEndpoint";\n`,
    `import SecuritySchemes from "@theme/ApiExplorer/SecuritySchemes";\n`,
    `import MimeTabs from "@theme/MimeTabs";\n`,
    `import ParamsItem from "@theme/ParamsItem";\n`,
    `import ResponseSamples from "@theme/ResponseSamples";\n`,
    `import SchemaItem from "@theme/SchemaItem";\n`,
    `import SchemaTabs from "@theme/SchemaTabs";\n`,
    `import Markdown from "@theme/Markdown";\n`,
    `import OperationTabs from "@theme/OperationTabs";\n`,
    `import TabItem from "@theme/TabItem";\n\n`,
    createHeading(title.replace(lessThan, "&lt;").replace(greaterThan, "&gt;")),
    createMethodEndpoint(method, path),
    infoPath && createAuthorization(infoPath),
    frontMatter.show_extensions
      ? createVendorExtensions(extensions)
      : undefined,
    createDeprecationNotice({ deprecated, description: deprecatedDescription }),
    createDescription(description),
    requestBody || parameters ? createRequestHeader("Request") : undefined,
    createParamsDetails({ parameters, type: "path" }),
    createParamsDetails({ parameters, type: "query" }),
    createParamsDetails({ parameters, type: "header" }),
    createParamsDetails({ parameters, type: "cookie" }),
    createRequestBodyDetails({
      title: "Body",
      body: requestBody,
    } as RequestBodyProps),
    createStatusCodes({ responses }),
    createCallbacks({ callbacks }),
  ]);
}

export function createInfoPageMD({
  info: {
    title,
    version,
    description,
    contact,
    license,
    termsOfService,
    logo,
    darkLogo,
  },
  securitySchemes,
  downloadUrl,
}: InfoPageMetadata) {
  return render([
    `import ApiLogo from "@theme/ApiLogo";\n`,
    `import SchemaTabs from "@theme/SchemaTabs";\n`,
    `import TabItem from "@theme/TabItem";\n`,
    `import Export from "@theme/ApiExplorer/Export";\n\n`,

    createVersionBadge(version),
    createDownload(downloadUrl),
    createHeading(title.replace(lessThan, "&lt;").replace(greaterThan, "&gt;")),
    createLogo(logo, darkLogo),
    createDescription(description),
    createAuthentication(securitySchemes as unknown as SecuritySchemeObject),
    createContactInfo(contact as ContactObject),
    createTermsOfService(termsOfService),
    createLicense(license as LicenseObject),
  ]);
}

export function createTagPageMD({ tag: { description } }: TagPageMetadata) {
  return render([createDescription(description)]);
}

export function createSchemaPageMD({ schema }: SchemaPageMetadata) {
  const { title = "", description } = schema;
  return render([
    `import DiscriminatorTabs from "@theme/DiscriminatorTabs";\n`,
    `import SchemaItem from "@theme/SchemaItem";\n`,
    `import SchemaTabs from "@theme/SchemaTabs";\n`,
    `import TabItem from "@theme/TabItem";\n\n`,
    createHeading(title.replace(lessThan, "&lt;").replace(greaterThan, "&gt;")),
    createDescription(description),
    create("ul", {
      children: createNodes(schema, "response"),
    }),
  ]);
}

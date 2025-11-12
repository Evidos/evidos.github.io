import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export const Scalar = () => (
  <ApiReferenceReact
    configuration={{
      url: "/openapi.yaml",
      hideTestRequestButton: true,
    }}
  />
);

declare module "*.svg" {
  import { ReactComponent as ReactComponentType } from "react";
  const content: ReactComponentType;
  export default content;
}

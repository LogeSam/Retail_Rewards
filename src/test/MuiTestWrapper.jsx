import { childrenPropType } from "../types/componentTypes.js";

export const MuiTestWrapper = ({ children }) => children;

MuiTestWrapper.propTypes = {
  children: childrenPropType,
};

MuiTestWrapper.defaultProps = {
  children: null,
};

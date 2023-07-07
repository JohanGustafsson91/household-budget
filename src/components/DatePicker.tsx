import DatePickerLib, {
  ReactDatePickerProps,
  registerLocale,
} from "react-datepicker";
import sv from "date-fns/locale/sv";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("sv", sv);

export const DatePicker = (props: ReactDatePickerProps) => (
  <DatePickerLib locale="sv" {...props} />
);

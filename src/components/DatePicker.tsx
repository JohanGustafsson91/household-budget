import DatePickerLib, {
  DatePickerProps,
  registerLocale,
} from "react-datepicker";
import { sv } from "date-fns/locale/sv";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("sv", sv);

export const DatePicker = (props: DatePickerProps) => (
  <DatePickerLib locale="sv" {...props} />
);

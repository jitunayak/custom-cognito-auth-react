import styled from "styled-components";

type IFieldDetails = {
  value: string;
  isError: boolean;
  errorMsg: string;
};
type Props = {
  placeHolder: string;
  fieldDetails: IFieldDetails;
  setFieldDetails: (value: any) => any;
  validator?: (value: string) => boolean;
  type: "password" | "email" | "text" | "number";
};

function InputBox({
  placeHolder,
  fieldDetails,
  setFieldDetails,
  validator,
  type,
}: Props) {
  return (
    <>
      <ErroMsg>{fieldDetails.isError && fieldDetails.errorMsg}</ErroMsg>
      <InputField
        placeholder={placeHolder}
        value={fieldDetails.value}
        error={fieldDetails.isError}
        type={type}
        onChange={(e) =>
          setFieldDetails((value: any): any => {
            return {
              ...value,
              value: e.target.value,
              isError: validator
                ? e.target.value.length > 1 && validator(e.target.value)
                : null,
            };
          })
        }
      />
    </>
  );
}

export default InputBox;

const ErroMsg = styled.label`
  text-align: start;
  color: red;
  font-weight: 400;
  margin-left: 0.2rem;
`;
const InputField = styled.input`
  padding: 0.6rem 1rem;
  font-weight: 400;

  color: ${(props: { error?: boolean }) => (props.error ? "red" : null)};
  margin: 0.4rem;
  border-radius: 0.2rem;
  outline-style: none;
  border: 0.6px solid
    ${(props: { error?: boolean }) => (props.error ? "red" : "grey")};
  background-color: "#d8d8d8";
  font-size: 1rem;
  ::placeholder,
  ::-webkit-input-placeholder {
    color: ${(props: { error?: boolean }) => (props.error ? "red" : "grey")};
  }
  :-ms-input-placeholder {
    color: ${(props: { error?: boolean }) => (props.error ? "red" : "grey")};
  }
`;

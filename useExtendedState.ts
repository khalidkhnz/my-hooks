import { useState } from "react";

interface IExtendedStateProps<T> {
  initialValues: T;
  onSubmit: (values: T) => void;
  dangerousCustomStateFunctions?: {
    values: T;
    setValues: (values: any) => void;
  };
}

interface IExtendedState<T> {
  values: T;
  setValues: (values: T) => void;
  resetValues: () => void;
  setFieldValue: (fullKeyPath: string, value: any) => void;
  handleSubmit: () => void;
}

function useExtendedState<T>({
  initialValues,
  onSubmit,
  dangerousCustomStateFunctions,
}: IExtendedStateProps<T>): IExtendedState<T> {
  const [useStateValues, useStateSetStateValues] = useState<T>(initialValues);

  const values = dangerousCustomStateFunctions?.values || useStateValues;
  const setStateValues =
    dangerousCustomStateFunctions?.setValues || useStateSetStateValues;

  function setValues(newValues: T) {
    setStateValues(newValues);
  }

  function resetValues() {
    setStateValues(initialValues);
  }

  function setFieldValue(fullKeyPath: string, value: any) {
    const updatedValues = { ...values };
    ExtractAndChangeValue<T>(fullKeyPath, value, updatedValues);
    setStateValues(updatedValues);
  }

  function isObject(item: any): boolean {
    return typeof item === "object" && !Array.isArray(item) && item !== null;
  }

  function ExtractAndChangeValue<T>(path: string, value: any, values: any) {
    const keys = path.split(".");
    let current: any = values;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        if (Array.isArray(current)) {
          const idx = parseInt(key);
          if (!isNaN(idx) && idx >= 0 && idx < current.length) {
            current[idx] = value;
          }
        } else if (isObject(current)) {
          current[key] = value;
        }
      } else {
        if (Array.isArray(current)) {
          const idx = parseInt(key);
          if (!isNaN(idx) && idx >= 0 && idx < current.length) {
            current = current[idx];
          }
        } else if (isObject(current)) {
          current = current[key];
        }
      }
    });
  }

  function handleSubmit() {
    onSubmit(values);
  }

  return { values, setValues, setFieldValue, resetValues, handleSubmit };
}

export default useExtendedState;

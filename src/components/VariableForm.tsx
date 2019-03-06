// Copyright 2019 Stratumn
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import { Form } from "semantic-ui-react";

import VariableFormField, {
  IProps as IVariableFormFieldProps
} from "./VariableFormField";

export interface IVariable {
  name: string;
  value: string;
  save: boolean;
}

export interface IProps {
  variables: IVariable[];
  onChangeVariable: (values: IVariableFormFieldProps) => any;
  onSubmit: (values: IProps) => any;
}

export default function(props: IProps) {
  const { variables, onChangeVariable, onSubmit } = props;
  const handleSubmit = () => onSubmit({ ...props });

  const fields = variables.map(variable => {
    return (
      <VariableFormField
        {...variable}
        key={variable.name}
        onChange={onChangeVariable}
      />
    );
  });

  return <Form onSubmit={handleSubmit}>{fields}</Form>;
}


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

import React, { Component, Fragment } from "react";
import {
  Button,
  DropdownProps,
  Form,
  InputProps,
} from "semantic-ui-react";

export enum SourceType { Directory = "directory", Git = "git" }

export interface IProps {
  type: SourceType;
  directory: string;
  repository: string;
  branch: string;
  onChange: (values: IProps) => any;
  onSubmit: (values: IProps) => any;
}

export default class AddSourceForm extends Component<IProps> {

  public render() {
    const { type, directory, repository, branch } = this.props;
    const options = [
      { key: SourceType.Directory, text: "Directory", value: SourceType.Directory },
      { key: SourceType.Git, text: "Git", value: SourceType.Git },
    ];
    const disabled = type === SourceType.Directory && !directory ||
      type === SourceType.Git && !repository;

    let typeFields: JSX.Element;

    if (type === "directory") {
      typeFields = (
        <Form.Field>
          <label>Directory (absolute path)</label>
          <Form.Input
            name="directory"
            value={directory}
            onChange={this.handleChangeInput}
          />
        </Form.Field>
      );
    } else {
      typeFields = (
        <Fragment>
          <Form.Field>
            <label>Repository</label>
            <Form.Input
              name="repository"
              value={repository}
              onChange={this.handleChangeInput}
            />
          </Form.Field>
          <Form.Field>
            <label>Branch</label>
            <Form.Input
              name="branch"
              placeholder="master"
              value={branch}
              onChange={this.handleChangeInput}
            />
          </Form.Field>
        </Fragment>
      );
    }

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Select
          label="Type"
          options={options}
          value={type}
          width="3"
          onChange={this.handleChangeType}
        />
        {typeFields}
        <Button
          type="submit"
          color="teal"
          icon="add"
          content="Add"
          disabled={disabled}
        />
      </Form>
    );
  }

  private handleSubmit = () => {
    this.props.onSubmit({ ...this.props });
  }

  private handleChangeType = (_: React.SyntheticEvent<HTMLElement>, { value }: DropdownProps) => {
    switch (value) {
    case "directory":
    case "git":
      this.props.onChange({ ...this.props, type: value as SourceType });
      break;
    }
  }

  private handleChangeInput = (_: React.SyntheticEvent<HTMLElement>, { name, value }: InputProps) => {
    const { onChange } = this.props;

    switch (name) {
    case "directory":
      onChange({ ...this.props, directory: value });
      break;
    case "repository":
      onChange({ ...this.props, repository: value });
      break;
    case "branch":
      onChange({ ...this.props, branch: value });
      break;
    }
  }

}

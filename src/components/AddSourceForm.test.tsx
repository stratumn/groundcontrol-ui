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

import { shallow } from "enzyme";
import React from "react";
import { mocked } from "ts-jest/utils";

import AddSourceForm, { SourceType } from "./AddSourceForm";

const props = {
  directory: "directory",
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  reference: "reference",
  repository: "repository",
  type: SourceType.Directory,
};

beforeEach(() => {
  mocked(props.onChange).mockClear();
  mocked(props.onSubmit).mockClear();
});

describe("<AddSourceForm />", () => {
  it("renders correctly when a directory source type is selected", () => {
    const wrapper = shallow(
      <AddSourceForm {...props} type={SourceType.Directory} />,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("renders correctly when a Git source type is selected", () => {
    const wrapper = shallow(<AddSourceForm {...props} type={SourceType.Git} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("triggers onChange when a source type is selected", () => {
    const wrapper = shallow(
      <AddSourceForm {...props} type={SourceType.Directory} />,
    );
    wrapper.find("[label='Type']").simulate("change", null, {
      value: "git",
    });
    expect(props.onChange).toBeCalledTimes(1);
    expect(props.onChange).toBeCalledWith({ ...props, type: "git" });
  });

  it("triggers onChange when a value is changed", () => {
    const wrapper = shallow(
      <AddSourceForm {...props} type={SourceType.Directory} />,
    );
    wrapper.find("[name='directory']").simulate("change", null, {
      name: "directory",
      value: "new",
    });
    expect(props.onChange).toBeCalledTimes(1);
    expect(props.onChange).toBeCalledWith({ ...props, directory: "new" });
  });

  it("triggers onSubmit when the form is submitted", () => {
    const wrapper = shallow(
      <AddSourceForm {...props} type={SourceType.Directory} />,
    );
    wrapper.find("Form").simulate("submit");
    expect(props.onSubmit).toBeCalledTimes(1);
    expect(props.onSubmit).toBeCalledWith(props);
  });
});

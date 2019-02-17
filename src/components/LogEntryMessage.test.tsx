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

import { mockQueryPropAttrs } from "../testing/relay";

import { LogEntryMessage } from "./LogEntryMessage";

const propsWithoutSourceFile = {
  item: {
    ...mockQueryPropAttrs(),
    message: "message",
    sourceFile: null,
    sourceFileBegin: null,
    sourceFileEnd: null,
  },
  onClickSourceFile: jest.fn(),
};

const propsWithSourceFile = {
  item: {
    ...mockQueryPropAttrs(),
    message: "message (message.ts:10)",
    sourceFile: "/path/to/message.ts:10",
    sourceFileBegin: 9,
    sourceFileEnd: 22,
  },
  onClickSourceFile: jest.fn(),
};

beforeEach(() => {
  mocked(propsWithSourceFile.onClickSourceFile).mockClear();
});

describe("<LogEntryMessage />", () => {

  it("renders correctly without a source file", () => {
    const wrapper = shallow(<LogEntryMessage {...propsWithoutSourceFile} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders correctly with a source file", () => {
    const wrapper = shallow(<LogEntryMessage {...propsWithSourceFile} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("triggers onClickSourceFile when the source file is clicked", () => {
    const wrapper = shallow(<LogEntryMessage {...propsWithSourceFile} />);
    const event = { preventDefault: jest.fn(), target: { href: "file:///path/to/message.ts:10" } };
    wrapper.find("div").simulate("click", event);
    expect(event.preventDefault).toBeCalledTimes(1);
    expect(propsWithSourceFile.onClickSourceFile).toBeCalledTimes(1);
    expect(propsWithSourceFile.onClickSourceFile).toBeCalledWith(propsWithSourceFile);
  });

});

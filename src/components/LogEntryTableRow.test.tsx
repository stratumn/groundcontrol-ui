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

import { LogEntryTableRow_item } from "./__generated__/LogEntryTableRow_item.graphql";
import { LogEntryTableRow_prevItem } from "./__generated__/LogEntryTableRow_prevItem.graphql";

import { mockQueryPropAttrs } from "../testing/relay";

import { LogEntryTableRow, Namespace } from "./LogEntryTableRow";

const other: LogEntryTableRow_item = {
  ...mockQueryPropAttrs(),
  createdAt: "createdAt",
  level: "INFO",
  owner: {
    id: "ownerId"
  }
};

const stringer: LogEntryTableRow_item = {
  ...mockQueryPropAttrs(),
  createdAt: "createdAt",
  level: "INFO",
  owner: {
    id: "ownerId",
    string: "string"
  }
};

const longStringer: LogEntryTableRow_item = {
  ...mockQueryPropAttrs(),
  createdAt: "createdAt",
  level: "INFO",
  owner: {
    id: "ownerId",
    longString: "longString"
  }
};

const prevItem: LogEntryTableRow_prevItem = {
  ...mockQueryPropAttrs(),
  createdAt: "createdAt",
  level: "INFO",
  owner: {
    id: "ownerId"
  }
};

const otherProps = {
  item: other,
  onClickSourceFile: jest.fn(),
  prevItem: null
};

const stringerProps = {
  item: stringer,
  onClickSourceFile: jest.fn(),
  prevItem: null
};

const longStringerProps = {
  item: longStringer,
  onClickSourceFile: jest.fn(),
  prevItem: null
};

const similarProps = {
  item: other,
  onClickSourceFile: jest.fn(),
  prevItem
};

describe("<Namespace />", () => {
  it("renders correctly", () => {
    const wrapper = shallow(<Namespace {...otherProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders correctly when the owner is a stringer", () => {
    const wrapper = shallow(<Namespace {...stringerProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders correctly when the owner is a longStringer", () => {
    const wrapper = shallow(<Namespace {...longStringerProps} />);
    expect(wrapper).toMatchSnapshot();
  });
});

describe("<LogEntryTableRow />", () => {
  it("renders correctly", () => {
    const wrapper = shallow(<LogEntryTableRow {...otherProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("sets the warning attribute of the level cell to true when the level is warning", () => {
    const wrapper = shallow(
      <LogEntryTableRow
        {...{ ...otherProps, item: { ...other, level: "WARNING" } }}
      />
    );
    expect(wrapper.find("[warning=true]")).toHaveLength(1);
  });

  it("sets the error attribute of the status cell to true when the level is error", () => {
    const wrapper = shallow(
      <LogEntryTableRow
        {...{ ...otherProps, item: { ...other, level: "ERROR" } }}
      />
    );
    expect(wrapper.find("[error=true]")).toHaveLength(1);
  });

  it("doesn't display meta if the previous entry is similar", () => {
    const wrapper = shallow(<LogEntryTableRow {...similarProps} />);
    expect(wrapper.find("Namespacej")).toHaveLength(0);
  });

  it("displays meta if the previous entry's createdAt is different", () => {
    const wrapper = shallow(
      <LogEntryTableRow
        {...{ ...otherProps, prevItem: { ...prevItem, createdAt: "new" } }}
      />
    );
    expect(wrapper.find("Namespace")).toHaveLength(1);
  });

  it("displays meta if the previous entry's level is different", () => {
    const wrapper = shallow(
      <LogEntryTableRow
        {...{ ...otherProps, prevItem: { ...prevItem, level: "DEBUG" } }}
      />
    );
    expect(wrapper.find("Namespace")).toHaveLength(1);
  });

  it("displays meta if the previous entry's owner is different", () => {
    const wrapper = shallow(
      <LogEntryTableRow
        {...{ ...otherProps, prevItem: { ...prevItem, owner: null } }}
      />
    );
    expect(wrapper.find("Namespace")).toHaveLength(1);
  });
  it("displays meta if the previous entry's owner id is different", () => {
    const wrapper = shallow(
      <LogEntryTableRow
        {...{ ...otherProps, prevItem: { ...prevItem, owner: { id: "new" } } }}
      />
    );
    expect(wrapper.find("Namespace")).toHaveLength(1);
  });
});

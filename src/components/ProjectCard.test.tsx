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

import { ProjectCard_item } from "./__generated__/ProjectCard_item.graphql";

import { mockQueryPropAttrs } from "../testing/relay";

import { IProps, ProjectCard } from "./ProjectCard";

jest.mock("./RepositoryShortName", () => "RepositoryShortName");

const item: ProjectCard_item = {
  ...mockQueryPropAttrs(),
  description: "description",
  id: "id",
  isAhead: false,
  isBehind: false,
  isCloned: false,
  isCloning: false,
  isPulling: false,
  localReferenceShort: "localReferenceShort",
  remoteCommits: {
    edges: [{
      node: {
        ...mockQueryPropAttrs(),
      },
    }, {
      node: {
        ...mockQueryPropAttrs(),
      },
    }],
  },
  remoteReferenceShort: "remoteReferenceShort",
  repository: "repository",
};

const props = {
  item,
  onClone: jest.fn(),
  onPull: jest.fn(),
};

beforeEach(() => {
  mocked(props.onClone).mockClear();
  mocked(props.onPull).mockClear();
});

describe("<ProjectCard />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(<ProjectCard {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("shows a clone button if the project isn't cloned", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: false, isCloning: false } }}
      />,
    );
    expect(wrapper.find("Button[icon='clone'][loading=false]")).toHaveLength(1);
  });

  it("shows a loading clone button if the project is cloning", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: false, isCloning: true } }}
      />,
    );
    expect(wrapper.find("Button[icon='clone'][loading=true]")).toHaveLength(1);
  });

  it("shows a pull button if the project is cloned and behind", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: true, isBehind: true } }}
      />,
    );
    expect(wrapper.find("Button[icon='download'][disabled=false]")).toHaveLength(1);
  });

  it("shows a disabled pull button if the project is cloned and up-to-date", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: true, isBehind: false } }}
      />,
    );
    expect(wrapper.find("Button[icon='download'][disabled=true]")).toHaveLength(1);
  });

  it("shows a loading pull button if the project is pulling", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: true, isPulling: true } }}
      />,
    );
    expect(wrapper.find("Button[icon='download'][loading=true]")).toHaveLength(1);
  });

  it("shows a cloned label if the project is cloned", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: true } }}
      />,
    );
    expect(wrapper.find("Label[content='cloned']")).toHaveLength(1);
  });

  it("shows an up-to-date label if the project is up-to-date", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: true, isBehind: false, isAhead: false } }}
      />,
    );
    expect(wrapper.find("Label[content='up-to-date']")).toHaveLength(1);
  });

  it("shows a behind label if the project is behind", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: true, isBehind: true } }}
      />,
    );
    expect(wrapper.find("Label[content='behind']")).toHaveLength(1);
  });

  it("shows an ahead label if the project is ahead", () => {
    const wrapper = shallow(
      <ProjectCard
        {...{...props, item: { ...item, isCloned: true, isAhead: true } }}
      />,
    );
    expect(wrapper.find("Label[content='ahead']")).toHaveLength(1);
  });

  it("triggers onClone when the clone button is clicked", () => {
    const cloneProps: IProps = {...props, item: { ...item, isCloned: false } };
    const wrapper = shallow(<ProjectCard {...cloneProps} />);
    wrapper.find("Button[icon='clone']").simulate("click");
    expect(cloneProps.onClone).toBeCalledTimes(1);
    expect(cloneProps.onClone).toBeCalledWith(cloneProps);
  });

  it("triggers onPull when the pull button is clicked", () => {
    const pullProps: IProps = {...props, item: { ...item, isCloned: true, isBehind: true } };
    const wrapper = shallow(<ProjectCard {...pullProps} />);
    wrapper.find("Button[icon='download']").simulate("click");
    expect(pullProps.onPull).toBeCalledTimes(1);
    expect(pullProps.onPull).toBeCalledWith(pullProps);
  });

});

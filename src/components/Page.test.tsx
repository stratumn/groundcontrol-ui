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

import Page from "./Page";

describe("<Page />", () => {

  it("renders correctly", () => {
    const wrapper = shallow(
      <Page
        header="header"
        subheader="subheader"
        icon="rocket"
      >
        <p>Hello, World!</p>
      </Page>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("renders correctly with a CSS class", () => {
    const wrapper = shallow(
      <Page
        header="header"
        subheader="subheader"
        icon="rocket"
        className="className"
      >
        <p>Hello, World!</p>
      </Page>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("renders correctly without a container", () => {
    const wrapper = shallow(
      <Page
        header="header"
        subheader="subheader"
        icon="rocket"
        container={false}
      >
        <p>Hello, World!</p>
      </Page>,
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("renders children when passed in", () => {
    const wrapper = shallow(
      <Page
        header="header"
        subheader="subheader"
        icon="rocket"
      >
        <div className="unique" />
      </Page>,
    );
    expect(wrapper.contains(<div className="unique" />)).toEqual(true);
  });

});

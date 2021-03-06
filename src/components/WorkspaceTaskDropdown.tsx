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

import graphql from "babel-plugin-relay/macro";
import React from "react";
import { createFragmentContainer } from "react-relay";
import { Dimmer, Dropdown, Loader } from "semantic-ui-react";

import { WorkspaceTaskDropdown_items } from "./__generated__/WorkspaceTaskDropdown_items.graphql";

export interface IProps {
  items: WorkspaceTaskDropdown_items;
  enabled: boolean;
  onRun: (values: IProps, id: string) => any;
}

export function WorkspaceTaskDropdown(props: IProps) {
  const { enabled, items, onRun } = props;
  const handleRun = (id: string) => onRun({ ...props }, id);

  const dropdownItems = items.map(({ id, name, status }) => (
    <Dropdown.Item
      key={id}
      disabled={status !== "STOPPED" && status !== "FAILED"}
      onClick={handleRun.bind(null, id)}
    >
      <Dimmer
        active={status !== "STOPPED" && status !== "FAILED"}
        inverted={true}
      >
        <Loader size="tiny" />
      </Dimmer>
      {name}
    </Dropdown.Item>
  ));

  return (
    <Dropdown item={true} text="Tasks" pointing={true} disabled={!enabled}>
      <Dropdown.Menu>{dropdownItems}</Dropdown.Menu>
    </Dropdown>
  );
}

export default createFragmentContainer(
  WorkspaceTaskDropdown,
  graphql`
    fragment WorkspaceTaskDropdown_items on Task @relay(plural: true) {
      id
      name
      status
    }
  `
);

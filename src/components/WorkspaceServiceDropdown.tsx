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
import {
  Dimmer,
  Dropdown,
  Loader,
} from "semantic-ui-react";

import { WorkspaceServiceDropdown_items } from "./__generated__/WorkspaceServiceDropdown_items.graphql";

export interface IProps {
  items: WorkspaceServiceDropdown_items;
  enabled: boolean;
  onLaunch: (values: IProps, id: string) => any;
}

export function WorkspaceServiceDropdown(props: IProps) {
  const { enabled, items, onLaunch } = props;
  const handleLaunch = (id: string) => onLaunch({ ...props }, id);

  const dropdownItems = items.map(({ id, name, status }) => (
    <Dropdown.Item
      key={id}
      disabled={status !== "STOPPED" && status !== "FAILED"}
      onClick={handleLaunch.bind(null, id)}
    >
      <Dimmer
        active={status === "STARTING"}
        inverted={true}
      >
        <Loader size="tiny" />
      </Dimmer>
      {name}
    </Dropdown.Item>
  ));

  return (
    <Dropdown
      item={true}
      text="Services"
      pointing={true}
      disabled={!enabled}
    >
      <Dropdown.Menu>
        {dropdownItems}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default createFragmentContainer(WorkspaceServiceDropdown, graphql`
  fragment WorkspaceServiceDropdown_items on Service @relay(plural: true) {
    id
    name
    status
  }`,
);

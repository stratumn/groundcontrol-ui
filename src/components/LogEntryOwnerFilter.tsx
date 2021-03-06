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
import { Dropdown, DropdownProps } from "semantic-ui-react";

import { LogEntryOwnerFilter_items } from "./__generated__/LogEntryOwnerFilter_items.graphql";

import "./LogEntryOwnerFilter.css";

export interface IProps {
  systemId: string;
  items: LogEntryOwnerFilter_items;
  ownerId?: string;
  onChange: (values: IProps) => any;
}

interface IOption {
  key: string;
  text: string;
  value: string;
}

export function LogEntryOwnerFilter(props: IProps) {
  const { systemId, items, ownerId, onChange } = props;
  const options = [
    {
      key: systemId,
      text: "System",
      value: systemId
    }
  ];

  for (const workspace of items) {
    const edges = workspace.services.edges.concat(workspace.tasks.edges);
    for (const {
      node: { id, name }
    } of edges) {
      options.push({
        key: id,
        text: `${workspace.name} » ${name}`,
        value: id
      });
    }
  }

  const handleChange = (
    _: React.SyntheticEvent<HTMLElement>,
    { value }: DropdownProps
  ) => {
    onChange({
      ...props,
      ownerId: value ? (value as string) : undefined
    });
  };

  return (
    <Dropdown
      className="LogEntryOwnerFilter"
      placeholder="Choose Namespace..."
      fluid={true}
      search={true}
      selection={true}
      clearable={true}
      options={options}
      value={ownerId}
      onChange={handleChange}
    />
  );
}

export default createFragmentContainer(
  LogEntryOwnerFilter,
  graphql`
    fragment LogEntryOwnerFilter_items on Workspace @relay(plural: true) {
      name
      services {
        edges {
          node {
            id
            name
          }
        }
      }
      tasks {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `
);

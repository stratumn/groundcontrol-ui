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
  Icon,
  Menu,
} from "semantic-ui-react";

import { WorkspaceMenu_item } from "./__generated__/WorkspaceMenu_item.graphql";

import WorkspaceTaskDropdown, {
  IProps as IWorkspaceTaskDropdownProps,
} from "./WorkspaceTaskDropdown";

export interface IProps {
  item: WorkspaceMenu_item;
  onClone: (values: IProps) => any;
  onPull: (values: IProps) => any;
  onRun: (values: IWorkspaceTaskDropdownProps, id: string) => any;
}

export function WorkspaceMenu(props: IProps) {
  const {
    item: {
      tasks,
      isCloning,
      isCloned,
      isPulling,
      isBehind,
    },
    onClone,
    onPull,
    onRun,
  } = props;
  const taskNodes = tasks.edges.map(({ node }) => node);
  const handleClone = () => onClone({ ...props });
  const handlePull = () => onPull({ ...props });

  return (
    <Menu size="large">
      <Menu.Item
        disabled={isCloning || isCloned}
        onClick={handleClone}
      >
        <Icon name="clone" />
        Clone All
      </Menu.Item>
      <Menu.Item
        disabled={isPulling || !isCloned || !isBehind}
        onClick={handlePull}
      >
        <Icon name="download" />
        Pull All
      </Menu.Item>
      <WorkspaceTaskDropdown
        items={taskNodes}
        enabled={isCloned}
        onRun={onRun}
      />
    </Menu>
  );
}

export default createFragmentContainer(WorkspaceMenu, graphql`
  fragment WorkspaceMenu_item on Workspace {
    tasks {
      edges {
        node {
          ...WorkspaceTaskDropdown_items
        }
      }
    }
    isCloning
    isCloned
    isPulling
    isBehind
  }`,
);

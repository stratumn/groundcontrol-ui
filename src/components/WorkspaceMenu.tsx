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
import { Icon, Menu } from "semantic-ui-react";

import { WorkspaceMenu_item } from "./__generated__/WorkspaceMenu_item.graphql";

import WorkspaceServiceDropdown, { IProps as IWorkspaceServiceDropdownProps } from "./WorkspaceServiceDropdown";
import WorkspaceTaskDropdown, { IProps as IWorkspaceTaskDropdownProps } from "./WorkspaceTaskDropdown";

export interface IProps {
  item: WorkspaceMenu_item;
  onClone: (values: IProps) => any;
  onPull: (values: IProps) => any;
  onStart: (values: IWorkspaceServiceDropdownProps, id: string) => any;
  onRun: (values: IWorkspaceTaskDropdownProps, id: string) => any;
}

export function WorkspaceMenu(props: IProps) {
  const {
    item: {
      projects,
      services,
      tasks,
    },
    onClone,
    onPull,
    onStart,
    onRun,
  } = props;
  const serviceNodes = services.edges.map(({ node }) => node);
  const taskNodes = tasks.edges.map(({ node }) => node);
  const projectNodes = projects.edges.map(({ node }) => node);
  const projectCount = projectNodes.length;
  const clonedCount = projectNodes.filter((node) => node.isCloned).length;
  const cloningCount = projectNodes.filter((node) => node.isCloning).length;
  const pullingCount = projectNodes.filter((node) => node.isPulling).length;
  const behindCount = projectNodes.filter((node) => node.isBehind).length;
  const handleClone = () => onClone({ ...props });
  const handlePull = () => onPull({ ...props });

  return (
    <Menu
      size="huge"
      secondary={true}
    >
      <Menu.Item
        disabled={cloningCount > 0 || clonedCount >= projectCount}
        onClick={handleClone}
      >
        <Icon name="clone" />
        Clone
      </Menu.Item>
      <Menu.Item
        disabled={pullingCount > 0 || clonedCount < 1 || behindCount < 1}
        onClick={handlePull}
      >
        <Icon name="download" />
        Pull
      </Menu.Item>
      <WorkspaceServiceDropdown
        items={serviceNodes}
        enabled={serviceNodes.length > 0}
        onStart={onStart}
      />
      <WorkspaceTaskDropdown
        items={taskNodes}
        enabled={taskNodes.length > 0}
        onRun={onRun}
      />
    </Menu>
  );
}

export default createFragmentContainer(WorkspaceMenu, graphql`
  fragment WorkspaceMenu_item on Workspace {
    projects {
      edges {
        node {
          isCloning
          isCloned
          isPulling
          isBehind
        }
      }
    }
    services {
      edges {
        node {
          ...WorkspaceServiceDropdown_items
        }
      }
    }
    tasks {
      edges {
        node {
          ...WorkspaceTaskDropdown_items
        }
      }
    }
  }`,
);

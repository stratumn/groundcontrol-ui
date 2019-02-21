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
import React, { Component } from "react";
import { createFragmentContainer, RelayProp } from "react-relay";
import { Disposable } from "relay-runtime";
import { SemanticWIDTHS } from "semantic-ui-react";

import { WorkspaceViewPage_system } from "./__generated__/WorkspaceViewPage_system.graphql";
import { WorkspaceViewPage_viewer } from "./__generated__/WorkspaceViewPage_viewer.graphql";

import Page from "../components/Page";
import { IProps as IProjectCardProps } from "../components/ProjectCard";
import ProjectCardGroup from "../components/ProjectCardGroup";
import { IVariable } from "../components/VariableForm";
import { IProps as IVariableFormProps} from "../components/VariableForm";
import { IProps as IVariableFormFieldProps} from "../components/VariableFormField";
import VariableFormModal from "../components/VariableFormModal";
import WorkspaceMenu from "../components/WorkspaceMenu";
import WorkspaceNotes from "../components/WorkspaceNotes";
import { IProps as IWorkspaceTaskDropdownProps } from "../components/WorkspaceTaskDropdown";
import { commit as cloneProject } from "../mutations/cloneProject";
import { commit as cloneWorkspace } from "../mutations/cloneWorkspace";
import { commit as loadWorkspaceCommits } from "../mutations/loadWorkspaceCommits";
import { commit as pullProject } from "../mutations/pullProject";
import { commit as pullWorkspace } from "../mutations/pullWorkspace";
import { commit as run } from "../mutations/run";
import { subscribe as subscribeProject } from "../subscriptions/projectStored";
import { subscribe as subscribeTask } from "../subscriptions/taskStored";
import { subscribe as subscribeWorkspace } from "../subscriptions/workspaceStored";
import ErrorPage from "./ErrorPage";

export interface IProps {
  relay: RelayProp;
  system: WorkspaceViewPage_system;
  viewer: WorkspaceViewPage_viewer;
}

interface IState {
  itemsPerRow: SemanticWIDTHS;
  variables?: IVariable[];
}

export class WorkspaceViewPage extends Component<IProps, IState> {

  public state: IState = {
    itemsPerRow: 3,
  };

  private disposables: Disposable[] = [];
  private taskID?: string;

  public render() {
    const workspace = this.props.viewer.workspace;

    if (!workspace) {
      return (
        <ErrorPage
          error={new Error("This workspace doesn't exist.")}
        />
      );
    }
    const items = workspace.projects.edges.map(({ node }) => node);
    const description = workspace.description || "This workspace doesn't have a description.";
    const { itemsPerRow, variables } = this.state;

    let modal: JSX.Element | null = null;

    if (variables) {
      modal = (
        <VariableFormModal
          variables={variables}
          onClose={this.handleCloseModal}
          onChangeVariable={this.handleChangeVariable}
          onSubmit={this.handleSubmitVariables}
        />
      );
    }

    return (
      <Page
        className="WorkspaceViewPage"
        header={workspace.name}
        subheader={description}
        icon="cube"
      >
        <WorkspaceMenu
          item={workspace}
          onClone={this.handleCloneWorkspace}
          onPull={this.handlePullWorkspace}
          onRun={this.handleRun}
        />
        <WorkspaceNotes item={workspace} />
        <ProjectCardGroup
          items={items}
          itemsPerRow={itemsPerRow}
          onClone={this.handleCloneProject}
          onPull={this.handlePullProject}
        />
        {modal}
      </Page>
    );
  }

  public componentDidMount() {
    const { workspace } = this.props.viewer;
    if (!workspace) {
      return;
    }

    const { relay: { environment }, system: { lastMessageId } } = this.props;
    const { id } = workspace;

    this.setItemsPerRow();
    window.addEventListener("resize", this.setItemsPerRow);

    this.disposables.push(
      {
        dispose: () => {
          window.removeEventListener("resize", this.setItemsPerRow);
        },
      },
      subscribeWorkspace(environment, lastMessageId, id),
      subscribeTask(environment, lastMessageId),
      subscribeProject(environment, lastMessageId),
    );

    loadWorkspaceCommits(environment, id);
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private findTask(id: string) {
    const edge = this.props.viewer.workspace!.tasks.edges.find((value) => {
      return value.node.id === id;
    });

    if (edge) {
      return edge.node;
    }
  }

  private doesTaskHaveVariables(id: string) {
    const task = this.findTask(id);

    if (task) {
      return task.variables.edges.length > 0;
    }

    return false;
  }

  private setItemsPerRow = () => {
    let itemsPerRow = Math.floor(window.innerWidth / 384);
    itemsPerRow = Math.min(Math.max(itemsPerRow, 1), 16);
    this.setState({ itemsPerRow: itemsPerRow as SemanticWIDTHS });
  }

  private handleCloneWorkspace = () => {
    cloneWorkspace(this.props.relay.environment, this.props.viewer.workspace!.id);
  }

  private handleCloneProject = ({ item: { id } }: IProjectCardProps) => {
    cloneProject(this.props.relay.environment, id);
  }

  private handlePullWorkspace = () => {
    pullWorkspace(this.props.relay.environment, this.props.viewer.workspace!.id);
  }

  private handlePullProject = ({ item: { id } }: IProjectCardProps) => {
    pullProject(this.props.relay.environment, id);
  }

  private handleRun = (_: IWorkspaceTaskDropdownProps, id: string) => {
    if (!this.doesTaskHaveVariables(id)) {
      run(this.props.relay.environment, id);
      return;
    }

    const task = this.findTask(id);
    if (!task) {
      return;
    }

    const vars = task.variables.edges.map(({ node }) => node);
    const keys = this.props.viewer.keys.edges.map(({ node }) => node);
    const keyMap: { [name: string]: string } = {};

    for (const key of keys) {
      keyMap[key.name] = key.value;
    }

    const variables: IVariable[] = vars.map((item) => ({
      name: item.name,
      save: true,
      value: keyMap[item.name] || item.default || "",
    }));

    this.taskID = id;
    this.setState({ variables });
  }

  private handleCloseModal = () => {
    this.taskID = undefined;
    this.setState({ variables: undefined });
  }

  private handleChangeVariable = ({ name, value, save }: IVariableFormFieldProps) => {
    const variables = this.state.variables!.map((v) => ({...v}));

    for (const variable of variables) {
      if (variable.name === name) {
        variable.value = value;
        variable.save = save;
        break;
      }
    }

    this.setState({ variables });
  }

  private handleSubmitVariables = ({ variables }: IVariableFormProps ) => {
    run(this.props.relay.environment, this.taskID!, variables);
    this.handleCloseModal();
  }

}

export default createFragmentContainer(WorkspaceViewPage, graphql`
  fragment WorkspaceViewPage_system on System {
    lastMessageId
  }
  fragment WorkspaceViewPage_viewer on User
    @argumentDefinitions(
      slug: { type: "String!" },
      commitsLimit: { type: "Int", defaultValue: 3 },
    ) {
    workspace(slug: $slug) {
      id
      name
      description
      tasks {
        edges {
          node {
            id
            variables {
              edges {
                node {
                  name
                  default
                }
              }
            }
          }
        }
      }
      projects {
        edges {
          node {
            ...ProjectCardGroup_items @arguments(commitsLimit: $commitsLimit)
          }
        }
      }
      ...WorkspaceNotes_item
      ...WorkspaceMenu_item
    }
    keys {
      edges {
        node {
          name
          value
        }
      }
    }
  }`,
);

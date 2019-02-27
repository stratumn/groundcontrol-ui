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
import ServiceProgressModal from "../components/ServiceProgressModal";
import TaskProgressModal from "../components/TaskProgressModal";
import { IVariable } from "../components/VariableForm";
import { IProps as IVariableFormProps} from "../components/VariableForm";
import { IProps as IVariableFormFieldProps} from "../components/VariableFormField";
import VariableFormModal from "../components/VariableFormModal";
import WorkspaceMenu from "../components/WorkspaceMenu";
import WorkspaceNotes from "../components/WorkspaceNotes";
import { IProps as IWorkspaceServiceDropdownProps } from "../components/WorkspaceServiceDropdown";
import { IProps as IWorkspaceTaskDropdownProps } from "../components/WorkspaceTaskDropdown";
import { commit as cloneProject } from "../mutations/cloneProject";
import { commit as cloneWorkspace } from "../mutations/cloneWorkspace";
import { commit as loadWorkspaceCommits } from "../mutations/loadWorkspaceCommits";
import { commit as openEditor } from "../mutations/openEditor";
import { commit as pullProject } from "../mutations/pullProject";
import { commit as pullWorkspace } from "../mutations/pullWorkspace";
import { commit as runTask } from "../mutations/runTask";
import { commit as startService } from "../mutations/startService";
import { subscribe as subscribeProjectStored } from "../subscriptions/projectStored";
import { subscribe as subscribeServiceStored } from "../subscriptions/serviceStored";
import { subscribe as subscribeTaskStored } from "../subscriptions/taskStored";
import { subscribe as subscribeWorkspaceStored } from "../subscriptions/workspaceStored";
import ErrorPage from "./ErrorPage";

export interface IProps {
  relay: RelayProp;
  system: WorkspaceViewPage_system;
  viewer: WorkspaceViewPage_viewer;
}

interface IState {
  itemsPerRow: SemanticWIDTHS;
  showVariableModal: boolean;
  showServiceProgressModal: boolean;
  showTaskProgressModal: boolean;
  isService: boolean;
  serviceID?: string;
  taskID?: string;
  variables?: IVariable[];
}

export class WorkspaceViewPage extends Component<IProps, IState> {

  public state: IState = {
    isService: false,
    itemsPerRow: 3,
    showServiceProgressModal: false,
    showTaskProgressModal: false,
    showVariableModal: false,
  };

  private disposables: Disposable[] = [];

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
    const {
      itemsPerRow,
      serviceID,
      taskID,
      showVariableModal,
      showServiceProgressModal,
      showTaskProgressModal,
      variables,
    } = this.state;

    let modal: JSX.Element | null = null;

    if (showVariableModal && variables) {
      modal = (
        <VariableFormModal
          variables={variables}
          onClose={this.handleCloseVariableModal}
          onChangeVariable={this.handleChangeVariable}
          onSubmit={this.handleSubmitVariables}
        />
      );
    } else if (showTaskProgressModal && taskID) {
      modal = (
        <TaskProgressModal
          item={this.findTask(taskID)!}
          onClose={this.handleCloseTaskProgressModal}
        />
      );
    } else if (showServiceProgressModal && serviceID) {
      modal = (
        <ServiceProgressModal
          item={this.findService(serviceID)!}
          onClose={this.handleCloseServiceProgressModal}
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
          onStart={this.handleStartService}
          onRun={this.handleRunTask}
        />
        <WorkspaceNotes item={workspace} />
        <ProjectCardGroup
          items={items}
          itemsPerRow={itemsPerRow}
          onClickPath={this.handleClickPath}
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
      subscribeWorkspaceStored(environment, lastMessageId, id),
      subscribeServiceStored(environment, undefined, lastMessageId),
      subscribeTaskStored(environment, lastMessageId),
      subscribeProjectStored(environment, lastMessageId),
    );

    loadWorkspaceCommits(environment, id);
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private findService(id: string) {
    const edge = this.props.viewer.workspace!.services.edges.find((value) => {
      return value.node.id === id;
    });

    if (edge) {
      return edge.node;
    }
  }

  private findTask(id: string) {
    const edge = this.props.viewer.workspace!.tasks.edges.find((value) => {
      return value.node.id === id;
    });

    if (edge) {
      return edge.node;
    }
  }

  private doesServiceHaveVariables(id: string) {
    const service = this.findService(id);

    if (service) {
      return service.allVariables.edges.length > 0;
    }

    return false;
  }

  private doesTaskHaveVariables(id: string) {
    const task = this.findTask(id);

    if (task) {
      return task.variables.edges.length > 0;
    }

    return false;
  }

  private setVariables(vars: Array<{name: string, default: string | null}>) {
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

    this.setState({ variables });
  }

  private setItemsPerRow = () => {
    let itemsPerRow = Math.floor(window.innerWidth / 384);
    itemsPerRow = Math.min(Math.max(itemsPerRow, 1), 16);
    this.setState({ itemsPerRow: itemsPerRow as SemanticWIDTHS });
  }

  private handleClickPath = ({ item: { path } }: IProjectCardProps) => {
    openEditor(this.props.relay.environment, path);
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

  private handleStartService = (_: IWorkspaceServiceDropdownProps, serviceID: string) => {
    if (!this.doesServiceHaveVariables(serviceID)) {
      this.setState({ serviceID, showServiceProgressModal: true });
      startService(this.props.relay.environment, serviceID);
      return;
    }

    const service = this.findService(serviceID);
    if (!service) {
      return;
    }

    const vars = service.allVariables.edges.map(({ node }) => node);

    this.setState({ isService: true, serviceID, showVariableModal: true });
    this.setVariables(vars);
  }

  private handleRunTask = (_: IWorkspaceTaskDropdownProps, taskID: string) => {
    if (!this.doesTaskHaveVariables(taskID)) {
      this.setState({ taskID, showTaskProgressModal: true });
      runTask(this.props.relay.environment, taskID);
      return;
    }

    const task = this.findTask(taskID);
    if (!task) {
      return;
    }

    const vars = task.variables.edges.map(({ node }) => node);

    this.setState({ isService: false, taskID, showVariableModal: true });
    this.setVariables(vars);
  }

  private handleCloseVariableModal = () => {
    this.setState({ showVariableModal: false });
  }

  private handleCloseServiceProgressModal = () => {
    this.setState({ showServiceProgressModal: false });
  }

  private handleCloseTaskProgressModal = () => {
    this.setState({ showTaskProgressModal: false });
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
    const { isService, serviceID, taskID } = this.state;

    if (isService && serviceID) {
      this.setState({ showServiceProgressModal: true });
      startService(this.props.relay.environment, serviceID, variables);
    } else if (!isService && taskID) {
      this.setState({ showTaskProgressModal: true });
      runTask(this.props.relay.environment, taskID, variables);
    }

    this.handleCloseVariableModal();
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
      services {
        edges {
          node {
            id
            allVariables {
              edges {
                node {
                  name
                  default
                }
              }
            }
            ...ServiceProgressModal_item
          }
        }
      }
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
            ...TaskProgressModal_item
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

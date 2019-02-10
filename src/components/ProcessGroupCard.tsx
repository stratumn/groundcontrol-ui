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
import { Link } from "found";
import React from "react";
import Moment from "react-moment";
import { createFragmentContainer } from "react-relay";
import {
  Button,
  Card,
  Icon,
 } from "semantic-ui-react";

import { ProcessGroupCard_item } from "./__generated__/ProcessGroupCard_item.graphql";

import ProcessTable from "./ProcessTable";
import { IProps as IProcessTableRowProps } from "./ProcessTableRow";

import "./ProcessGroupCard.css";

const dateFormat = "L LTS";

export interface IProps {
  item: ProcessGroupCard_item;
  onStartGroup: (values: IProps) => any;
  onStopGroup: (values: IProps) => any;
  onStartProcess: (values: IProcessTableRowProps) => any;
  onStopProcess: (values: IProcessTableRowProps) => any;
}

export function ProcessGroupCard(props: IProps) {
  const {
    item: {
      createdAt,
      status,
      processes,
      task,
      task: {
        workspace,
      },
    },
    onStartGroup,
    onStopGroup,
  } = props;
  const processNodes = processes.edges.map(({ node }) => node);
  const buttons: JSX.Element[] = [];
  const handleStart = () => onStartGroup({ ...props });
  const handleStop = () => onStopGroup({ ...props });

  switch (status) {
  case "RUNNING":
    buttons.push((
      <Button
        key="stop"
        color="teal"
        floated="right"
        icon={true}
        labelPosition="left"
        onClick={handleStop}
      >
        <Icon name="stop" />
        Stop Group
      </Button>
    ));
    break;
  case "DONE":
  case "FAILED":
    buttons.push((
      <Button
        key="start"
        color="teal"
        floated="right"
        icon={true}
        labelPosition="left"
        onClick={handleStart}
      >
        <Icon name="play" />
        Start Group
      </Button>
    ));
    break;
  }

  return (
    <Card
      className="ProcessGroupCard"
      fluid={true}
    >
      <Card.Content>
        <Card.Header>
          {buttons}
          <Link to={`/workspaces/${workspace.slug}`}>
            {workspace.name}
          </Link> / {task.name}
        </Card.Header>
        <Card.Meta>
          <Moment format={dateFormat}>{createdAt}</Moment>
        </Card.Meta>
      </Card.Content>
      <ProcessTable
        {...props}
        items={processNodes}
      />
    </Card>
  );
}

export default createFragmentContainer(ProcessGroupCard, graphql`
  fragment ProcessGroupCard_item on ProcessGroup {
    id
    createdAt
    status
    task {
      name
      workspace {
        slug
        name
      }
    }
    processes {
      edges {
        node {
          ...ProcessTable_items
        }
      }
    }
  }`,
);

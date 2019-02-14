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
import React, { Fragment } from "react";
import {
  Responsive,
  Table,
 } from "semantic-ui-react";

import Moment from "react-moment";
import { createFragmentContainer } from "react-relay";

import { LogEntryTableRow_item } from "./__generated__/LogEntryTableRow_item.graphql";

import LogEntryMessage, { IProps as ILogEntryMessageProps } from "./LogEntryMessage";

import "./LogEntryTableRow.css";

const dateFormat = "L LTS";

export interface IProps {
  item: LogEntryTableRow_item;
  onClickSourceFile: (values: ILogEntryMessageProps) => any;
}

export function LogEntryTableRow({
  item,
  item: {
    createdAt,
    level,
    owner,
  },
  onClickSourceFile,
}: IProps) {
  let ownerEl: JSX.Element | null = null;

  if (owner) {
    switch (owner.__typename) {
    case "Project":
      const workspaceSlug = owner.workspace!.slug;
      const projectSlug = owner.slug;
      ownerEl = (
        <Fragment>
          <Link to={`/workspaces/${workspaceSlug}`}>
            {workspaceSlug}
          </Link>
          &#47;
          {projectSlug}
        </Fragment>
      );
      break;
    }
  }

  return (
    <Table.Row
      className="LogEntryTableRow"
      verticalAlign="top"
    >
      <Responsive
        as={Table.Cell}
        className="LogEntryTableRowCreatedAt"
        minWidth={992}
        collapsing={true}
      >
        <Moment format={dateFormat}>{createdAt}</Moment>
      </Responsive>
      <Table.Cell
        className="LogEntryTableRowLevel"
        warning={level === "WARNING"}
        error={level === "ERROR"}
        collapsing={true}
      >
        {level}
      </Table.Cell>
      <Table.Cell collapsing={true}>
        {ownerEl}
      </Table.Cell>
      <Table.Cell>
        <LogEntryMessage
          item={item}
          onClickSourceFile={onClickSourceFile}
        />
      </Table.Cell>
    </Table.Row>
  );
}

export default createFragmentContainer(LogEntryTableRow, graphql`
  fragment LogEntryTableRow_item on LogEntry {
    createdAt
    level
    ...LogEntryMessage_item
    owner {
      __typename
      id
      ... on Project {
        slug
        workspace {
          slug
        }
      }
    }
  }`,
);

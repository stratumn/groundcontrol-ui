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
import React, { Fragment } from "react";
import { Responsive, Table } from "semantic-ui-react";

import Moment from "react-moment";
import { createFragmentContainer } from "react-relay";

import { LogEntryTableRow_item } from "./__generated__/LogEntryTableRow_item.graphql";
import { LogEntryTableRow_prevItem } from "./__generated__/LogEntryTableRow_prevItem.graphql";

import LogEntryMessage, {
  IProps as ILogEntryMessageProps
} from "./LogEntryMessage";

import "./LogEntryTableRow.css";

const dateFormat = "LTS";

export interface IProps {
  item: LogEntryTableRow_item;
  prevItem: LogEntryTableRow_prevItem | null;
  onClickSourceFile: (values: ILogEntryMessageProps) => any;
}

type Owner = LogEntryTableRow_item["owner"];

type LongStringer = Owner & {
  longString: string;
};

function isLongStringer(owner: Owner): owner is LongStringer {
  return !!owner && !!owner.longString;
}

type Stringer = Owner & {
  string: string;
};

function isStringer(owner: Owner): owner is Stringer {
  return !!owner && !!owner.string;
}

export function LogEntryTableRow(props: IProps) {
  const {
    item,
    item: { level },
    onClickSourceFile
  } = props;

  const showMeta = shouldShowMeta(props);

  return (
    <Table.Row className="LogEntryTableRow" verticalAlign="top">
      <Responsive
        as={Table.Cell}
        className="LogEntryTableRowCreatedAt"
        minWidth={992}
        collapsing={true}
      >
        {showMeta && <CreatedAt {...props} />}
      </Responsive>
      <Table.Cell collapsing={true}>
        {showMeta && <Namespace {...props} />}
      </Table.Cell>
      <Table.Cell
        className="LogEntryTableRowLevel"
        warning={level === "WARNING"}
        error={level === "ERROR"}
        collapsing={true}
      >
        {showMeta && level}
      </Table.Cell>
      <Table.Cell>
        <LogEntryMessage item={item} onClickSourceFile={onClickSourceFile} />
      </Table.Cell>
    </Table.Row>
  );
}

const CreatedAt = ({ item: { createdAt } }: IProps) => (
  <Moment format={dateFormat}>{createdAt}</Moment>
);

export const Namespace = ({ item: { owner } }: IProps) => {
  if (!owner) {
    return null;
  }

  if (isLongStringer(owner)) {
    return <Fragment>{owner.longString}</Fragment>;
  }

  if (isStringer(owner)) {
    return <Fragment>{owner.string}</Fragment>;
  }

  return <Fragment>owner.id</Fragment>;
};

function shouldShowMeta(props: IProps) {
  const {
    item: { createdAt, owner, level },
    prevItem
  } = props;

  if (!prevItem) {
    return true;
  }

  if (!owner !== !prevItem.owner) {
    return true;
  }

  if (owner && prevItem.owner && owner.id !== prevItem.owner.id) {
    return true;
  }

  return prevItem.level !== level || prevItem.createdAt !== createdAt;
}

export default createFragmentContainer(
  LogEntryTableRow,
  graphql`
    fragment LogEntryTableRow_item on LogEntry {
      createdAt
      level
      ...LogEntryMessage_item
      owner {
        id
        ... on LongStringer {
          longString
        }
        ... on Stringer {
          string
        }
      }
    }
    fragment LogEntryTableRow_prevItem on LogEntry {
      createdAt
      level
      owner {
        id
      }
    }
  `
);

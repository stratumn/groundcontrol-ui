
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
import ReactMarkdown from "react-markdown";
import { createFragmentContainer } from "react-relay";

import { WorkspaceNotes_item } from "./__generated__/WorkspaceNotes_item.graphql";

import "./WorkspaceNotes.css";

export interface IProps {
  item: WorkspaceNotes_item;
}

const WorkspaceNotes = ({ item: { notes } }: IProps) => (
  <ReactMarkdown
    source={notes || "This workspace doesn't have notes."}
    className="markdown-body"
  />
);

export default createFragmentContainer(WorkspaceNotes, graphql`
  fragment WorkspaceNotes_item on Workspace {
    notes
  }`,
);

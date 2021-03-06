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
import Moment from "react-moment";
import { createFragmentContainer } from "react-relay";
import { Feed } from "semantic-ui-react";

import { CommitFeedEvent_item } from "./__generated__/CommitFeedEvent_item.graphql";

import "./CommitFeedEvent.css";

export interface IProps {
  item: CommitFeedEvent_item;
}

export const CommitFeedEvent = ({
  item: { headline, author, date }
}: IProps) => (
  <Feed.Event className="CommitFeedEvent">
    <Feed.Content>
      <Feed.Summary>{headline}</Feed.Summary>
      <Feed.Meta>
        Pushed by <strong>{author}</strong>
        <Moment fromNow={true}>{date}</Moment>
      </Feed.Meta>
    </Feed.Content>
  </Feed.Event>
);

export default createFragmentContainer(
  CommitFeedEvent,
  graphql`
    fragment CommitFeedEvent_item on Commit {
      headline
      date
      author
    }
  `
);

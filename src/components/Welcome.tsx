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

import { Link } from "found";
import React from "react";
import { Button, Message } from "semantic-ui-react";

import Page from "../components/Page";

export default () => (
  <Page
    header="Welcome to Ground Control!"
    subheader="Hassle-free multi repository management."
    text={true}
  >
    <Message color="teal">
      <p>
        Before you can start working on cool apps, you need to add some sources.
        Sources contain workspaces which let you work on projects.
      </p>
      <p>
        <Link
          to="/sources"
          Component={Button}
          color="teal"
        >
          Let's add a source to get started!
        </Link>
      </p>
    </Message>
    <p>
      <em>Ground Control</em> is an application to help deal with multi-repository development
      using a user friendly web interface.
    </p>
    <p>
      Workspaces are defined using YAML files which can easily be shared.
      Each workspace contains multiple projects.
      A project corresponds to a Git reference of a repository (such as a branch or tag).
    </p>
    <p>
      The user interface allows you to perform operations on multiple projects at once,
      including:
    </p>
    <ul>
      <li>Automatically sync and share workspaces using <Link to="/sources">sources</Link></li>
      <li>
         Clone all the repositories in a workspace
         (defaults to <code>$HOME/groundcontrol/workspaces/$WORKSPACE/$PROJECT</code>)
      </li>
      <li>See if you are up-to-date or ahead of the remote repositories</li>
      <li>Run tasks on multiple repositories</li>
      <li>Launch services and their dependencies with ease</li>
    </ul>
    <p>
      Good luck and happy coding!
    </p>
  </Page>
);

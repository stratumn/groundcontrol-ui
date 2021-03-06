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
import React, { Fragment } from "react";
import { Menu } from "semantic-ui-react";

const MenuPrimaryItems = () => (
  <Fragment>
    <Link to="/workspaces" Component={Menu.Item} activePropName="active">
      Workspaces
    </Link>
    <Link to="/sources" Component={Menu.Item} activePropName="active">
      Sources
    </Link>
    <Link to="/keys" Component={Menu.Item} activePropName="active">
      Keys
    </Link>
  </Fragment>
);

export default MenuPrimaryItems;

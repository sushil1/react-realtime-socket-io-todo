import React from 'react'
import MenuItem from 'material-ui/MenuItem';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';


const TodoStatus = () => (
  <Toolbar>
        <ToolbarGroup>
          <MenuItem  primaryText="All Todos" />
          <ToolbarSeparator />
          <MenuItem  primaryText="Archived" />
          <ToolbarSeparator />
          <MenuItem  primaryText="Deleted" />
          <ToolbarSeparator />
          <MenuItem  primaryText="Filter" />
          <ToolbarSeparator />
        </ToolbarGroup>

      </Toolbar>
)

export default TodoStatus

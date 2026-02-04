import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";

function TreeNode({ node, level = 0, expandedIds, toggleNode, onEdit, onDelete }: any) {
  const isOpen = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <ListItem
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pl: level * 4,
          borderLeft: level > 0 ? "2px solid #2F3540" : "none",
          my: 0.5,
          borderRadius: 1,
          cursor: hasChildren ? "pointer" : "default",
          bgcolor: isOpen ? "#272B36" : level % 2 === 0 ? "#1E222B" : "#161B22",
          "&:hover": { bgcolor: "#323741" },
        }}
        onClick={() => hasChildren && toggleNode(node)}
      >
        <Box display="flex" alignItems="center" gap={1}>
          {hasChildren ? (
            <IconButton
              size="small"
              sx={{
                p: 0,
                color: "#00E5FF",
                transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 24 }} />
          )}

          <Box>
            <Typography variant="body1" sx={{ color: "#E6EDF3" }}>
              {node.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#9BA3AF" }}>
              Status:{" "}
              <Box
                component="span"
                sx={{
                  color: node.is_active ? "#2ECC71" : "#E53935",
                  fontWeight: 600,
                }}
              >
                {node.is_active ? "Active" : "Inactive"}
              </Box>
            </Typography>
          </Box>
        </Box>

        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            sx={{ color: "#00E5FF" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            sx={{ color: "#E53935" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </ListItem>

      {hasChildren && (
        <Collapse in={isOpen} timeout={300} unmountOnExit>
          <List disablePadding>
            {node.children.map((child: any) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                expandedIds={expandedIds}
                toggleNode={toggleNode}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default function SiteHierarchyTree({ rows, onEdit, onDelete }: any) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const getAllDescendantIds = (node: any): number[] => {
    let ids = [node.id];
    (node.children || []).forEach((child: any) => {
      ids = ids.concat(getAllDescendantIds(child));
    });
    return ids;
  };

  const toggleNode = (node: any) => {
    const allIds = getAllDescendantIds(node);
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      const isOpen = prev.has(node.id);
      allIds.forEach((id) => {
        if (isOpen) newSet.delete(id);
        else newSet.add(id);
      });
      return newSet;
    });
  };

  return (
    <Paper sx={{ p: 2, maxWidth: 900, bgcolor: "#161B22" }}>
      <List>
        {rows.map((node: any) => (
          <TreeNode
            key={node.id}
            node={node}
            level={0}
            expandedIds={expandedIds}
            toggleNode={toggleNode}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </List>
    </Paper>
  );
}

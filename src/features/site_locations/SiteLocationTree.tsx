import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  Chip,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import { useState } from "react";

function TreeNode({
  node,
  level = 0,
  expandedIds,
  toggleNode,
  onEdit,
  onDelete,
}: any) {
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
        {/* LEFT SIDE */}
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
              Hierarchy: {node.site_hierarchy_name ?? "—"}
            </Typography> 
            
            <Box display="flex" gap={1} mt={0.5}>
              <Chip
                size="small"
                icon={node.is_public ? <PublicIcon /> : <LockIcon />}
                label={node.is_public ? "Public" : "Private"}
                sx={{
                  bgcolor: node.is_public ? "#0F5132" : "#4A1C1C",
                  color: "#fff",
                }}
              />

              <Chip
                size="small"
                label={node.is_active ? "Active" : "Inactive"}
                sx={{
                  bgcolor: node.is_active ? "#1B5E20" : "#5A1A1A",
                  color: "#fff",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* RIGHT SIDE ACTIONS */}
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

export default function SiteLocationTree({ rows, onEdit, onDelete }: any) {
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

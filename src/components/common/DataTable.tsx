import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Box, Tooltip } from "@mui/material";

export default function DataTable({
  rows,
  columns,
  loading,
  paginationModel,
  onPaginationModelChange,
  rowCount,
  paginationMode = "server",
  onEdit,
  onDelete,
  onEmbedding, // ✅ NEW
  actionIcons,
  height = 480,
}: any) {
  const actionColumn = {
    field: "actions",
    headerName: "Actions",
    width: 160, // slightly wider for 3 icons
    sortable: false,
    filterable: false,
    renderCell: (params: any) => (
      <>
        {/* EDIT */}
        {onEdit && actionIcons?.edit && (
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(params.row)}
            >
              {actionIcons.edit}
            </IconButton>
          </Tooltip>
        )}

        {/* DELETE */}
        {onDelete && actionIcons?.delete && (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(params.row.id)}
            >
              {actionIcons.delete}
            </IconButton>
          </Tooltip>
        )}

        {/* EMBEDDING */}
        {onEmbedding && actionIcons?.embedding && (
          <Tooltip title="Collect Body Embedding">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => onEmbedding(params.row)}
            >
              {actionIcons.embedding}
            </IconButton>
          </Tooltip>
        )}
      </>
    ),
  };

  return (
    <Box sx={{ height, width: "100%" }}>
      <DataGrid
        rows={
          Array.isArray(rows)
            ? rows.map((row: any, index: number) => ({
                ...row,
                id:
                  row.id !== undefined
                    ? row.id
                    : row.member_id != null &&
                      row.access_group_id != null
                    ? `${row.member_id}-${row.access_group_id}`
                    : `row-${index}`,
              }))
            : []
        }
        columns={[...columns, actionColumn]}
        loading={loading}
        pagination
        paginationMode={paginationMode}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        rowCount={rowCount}
        pageSizeOptions={[10, 25, 50]}
        getRowClassName={(params) =>
          params.row.is_active === false ? "row-inactive" : ""
        }
        disableRowSelectionOnClick
        disableColumnResize
        sx={{
          border: "none",
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "rgba(0,229,255,0.06)",
          },
          "& .row-inactive": {
            opacity: 0.75,
            backgroundColor: "rgba(103,103,103,0.03)",
          },
          "& .row-inactive .MuiDataGrid-cell": {
            color: "rgba(208,216,224,0.7)",
          },
          "& .row-inactive:hover": {
            backgroundColor: "rgba(255,255,255,0.03)",
          },
          "& .row-inactive .MuiIconButton-root": {
            pointerEvents: "auto",
            opacity: 0.7,
          },
        }}
      />
    </Box>
  );
}

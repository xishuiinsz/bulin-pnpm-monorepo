import { onUnmounted, reactive, ref } from "vue"
export const pageSizes = [10, 20, 50, 100];
export const defaultPagination = {
    pageIndex: 1,
    pageSize: 10,
}

export const usePagination = (data = {
    ...defaultPagination,
    handleSearch: () => { }
}) => {
    const paginationState = reactive({
        pageIndex: data.pageIndex,
        pageSize: data.pageSize,
    })

    const total = ref(0)

    const resetPagination = () => {
        paginationState.pageIndex = defaultPagination.pageIndex
        paginationState.pageSize = defaultPagination.pageSize
    }

    const handlePageIndexChange = (newPageIndex: number) => {
        paginationState.pageIndex = newPageIndex;
        data.handleSearch?.();
    }

    const handlePageSizeChange = (newPageSize: number) => {
        paginationState.pageSize = newPageSize
        paginationState.pageIndex = defaultPagination.pageIndex
        data.handleSearch?.();
    }

    return {
        paginationState,
        resetPagination,
        total,
        handlePageIndexChange,
        handlePageSizeChange

    }
}

export const useExpandCollapseColumns = () => {
  const expandedColumns = reactive<Record<string, any>>({});
  const columnClick = (data: { name: string; children: any[] }) => {
    if (Object.keys(expandedColumns).includes(data.name)) {
      const restChildren = Reflect.get(expandedColumns, data.name);
      data.children.push(...restChildren);
      Reflect.deleteProperty(expandedColumns, data.name);
    } else {
      const restChildren = data.children.splice(1);
      expandedColumns[data.name] = restChildren;
    }
  };
  return {
    expandedColumns,
    columnClick,
  };
};

export const useLinkUpSearch = () => {
  const searchMap = new Map<Function, string>();

  const linkUpSearch = (handler: Function, name: string) => {
    const handlerList = [...searchMap.keys()];
    if (handlerList.includes(handler)) {
      const preName = searchMap.get(handler);
      if (String(preName) !== String(name)) {
        handlerList.forEach((item) => {
          if (item !== handler && typeof item === "function") {
            item(name);
          }
        });
      }
    } else {
      searchMap.set(handler, name);
    }
  };

  onUnmounted(() => {
    searchMap.clear();
  });

  return linkUpSearch;
};
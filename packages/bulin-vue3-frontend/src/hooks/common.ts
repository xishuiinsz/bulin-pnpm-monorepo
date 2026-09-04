import { reactive, ref } from "vue"
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
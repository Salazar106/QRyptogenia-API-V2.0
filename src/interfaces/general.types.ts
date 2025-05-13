//? interface used in get data to use un the data Tables to paginate and search the information 
export interface IPaginationsAndSearch {
    page?: number;
    pageSize?: number;
    search?: string;
    id_user?: string;
}
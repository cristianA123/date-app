export function successResponse<T>(data: T): { success: true; data: T } {
  return {
    success: true,
    data,
  };
}

export function errorResponse<T>(message: T): { success: false; data: T } {
  return {
    success: false,
    data: message,
  };
}

/** An expected, user-facing failure. The message is safe to show. */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class InsufficientBalanceError extends AppError {
  constructor(
    public needed: number,
    public available: number,
  ) {
    super(
      `You need ${needed} coins but have ${available} available. Help someone to earn more, or adjust the coin amount.`,
      "INSUFFICIENT_BALANCE",
    );
  }
}

export const notFound = (what = "That item") => new AppError(`${what} was not found.`, "NOT_FOUND");
export const forbidden = () => new AppError("You don't have access to this.", "FORBIDDEN");

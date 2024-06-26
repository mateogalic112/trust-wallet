import HttpException from "./HttpException";

class BadRequestException extends HttpException {
  message: string;
  constructor(message: string) {
    super(400, message);
    this.message = message;
  }
}

export default BadRequestException;

export class ValidationPart<T> {
  constructor(
    public failureInfo: string,
    public validationFunction: (entity: T) => boolean,
  ) {}
}

import * as MDB from 'molten-core';

export interface Field {
  /// Label for the field. If set, field will be available for use in a view.
  label?: MDB.LangString,

  /// Sub fields of the field
  fields: Field
}

export interface TypeComponent {
  /// ID of the type
  type: string,

  options: MDB.Type.Options,

  /**
   * Returns an array containing the fields of the Field and the labels for the
   * fields
   *
   * @param name ID of the field
   * @param options Options of the field
   */
  fields({ name: string, options: }): { [fieldId: string]: Field },

  /**
   * Create a 
  instance(): TypeInstance,
  /**
   * Creates and returns the label React component for the field
   *
   * @param name ID of the field
   * @param options Options of the field
   */
  label({ name: string, options: }): React.Component,

  /**
   * Creates and returns the value React component for the field
   *
   * @param name ID of the field
   * @param options Options of the field
   */
  field({ name: string, option: item: }): React.Component,

  /**
   * Returns the value of the field
   */
  value(): any,

  validate: MDB.Type.validate,

  test: MDB.Type.test
}

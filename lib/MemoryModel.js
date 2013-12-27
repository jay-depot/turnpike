/**
 * Base model class for storing in process memory.
 * Not directly useful in production environments. Storage here will only work
 * if there is only one worker process. i.e. running with # turnpike testdrive
 *
 * May also be useful as a caching wrapper around a more permanent and shared
 * form of storage as long as the datasets are VERY small, but I make no
 * guarantees, as nothing about this is designed to be fast.
 */


import { GetSignedUrlConfig } from "@google-cloud/storage";
import { PassThrough, Writable } from "stream";

interface MockedStorageConstructorProps {
  projectId: string;
  scopes: string;
  credentials: {
    client_email: string;
    private_key: string;
  };
}

/**
 * Mocked file instance on a storage bucket
 */
class MockedFile {
  private fileExists = false;

  constructor(private fileName: string) {}

  async delete(): Promise<null> {
    return null;
  }

  // Mock write stream with a PassThrough and mark as exists afterwards
  createWriteStream(): Writable {
    const stream = new PassThrough();
    stream.on("finish", () => {
      this.fileExists = true;
    });
    return stream;
  }

  async getSignedUrl(options: GetSignedUrlConfig): Promise<[string]> {
    return [`https://tartanhacks.com/file/${this.fileName}`];
  }

  async exists(): Promise<[boolean]> {
    return [this.fileExists];
  }
}

/**
 * Mocked storage bucket
 */
class MockedBucket {
  private files = {} as Record<string, MockedFile>;

  constructor(private bucketName: string) {}

  file(fileName: string): MockedFile {
    if (!this.files[fileName]) {
      this.files[fileName] = new MockedFile(fileName);
    }
    return this.files[fileName];
  }
}

/**
 * Mock the Storage class provided by @google-cloud/storage
 */
class MockedStorage {
  private buckets = {} as Record<string, MockedBucket>;

  constructor(private args: MockedStorageConstructorProps) {}

  bucket(bucketName: string): MockedBucket {
    if (!this.buckets[bucketName]) {
      this.buckets[bucketName] = new MockedBucket(bucketName);
    }
    return this.buckets[bucketName];
  }
}

export const Storage = MockedStorage;

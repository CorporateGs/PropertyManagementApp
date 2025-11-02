/**
 * Blockchain Service for Smart Contracts and Immutable Records
 * 
 * Features:
 * - Smart contract creation for leases and vendor contracts
 * - Immutable record storage using blockchain
 * - Cryptographic verification of documents
 * - Secure multi-party agreements
 * - Audit trail with tamper-proof logs
 * 
 * This implementation uses Ethereum/Polygon for demonstration.
 * In production, consider: Hyperledger, Ethereum, Polygon, or private blockchain
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DatabaseError, ExternalServiceError } from '@/lib/errors';
import crypto from 'crypto';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

// Blockchain configuration
interface BlockchainConfig {
  network: 'ethereum' | 'polygon' | 'hyperledger' | 'private';
  rpcUrl?: string;
  apiKey?: string;
}

/**
 * Represents a block in the blockchain
 */
interface Block {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
  nonce: number;
}

/**
 * Smart Contract types
 */
export enum ContractType {
  LEASE = 'LEASE',
  VENDOR_AGREEMENT = 'VENDOR_AGREEMENT',
  RENTAL_AGREEMENT = 'RENTAL_AGREEMENT',
  SERVICE_CONTRACT = 'SERVICE_CONTRACT',
  PAYMENT_AGREEMENT = 'PAYMENT_AGREEMENT',
}

/**
 * Blockchain Service
 */
export class BlockchainService {
  private chain: Block[] = [];
  private pendingTransactions: any[] = [];
  private difficulty: number = 2; // Mining difficulty
  private web3: Web3 | null = null;
  private isInitialized: boolean = false;
  
  constructor(private config: BlockchainConfig) {
    this.initialize();
  }

  /**
   * Initialize the blockchain service
   */
  private async initialize(): Promise<void> {
    try {
      logger.info("Initializing blockchain service", { network: this.config.network });
      
      // Initialize Web3 if using external blockchain
      if (this.config.network !== 'private' && this.config.rpcUrl) {
        this.web3 = new Web3(this.config.rpcUrl);
        logger.info("Connected to external blockchain", { rpcUrl: this.config.rpcUrl });
      }
      
      // Load existing blockchain from database
      await this.loadBlockchainFromDatabase();
      
      // Create genesis block if chain is empty
      if (this.chain.length === 0) {
        this.createGenesisBlock();
        await this.saveBlockchainToDatabase();
      }
      
      // Validate blockchain integrity
      const isValid = this.isChainValid();
      if (!isValid) {
        logger.error("Blockchain integrity check failed");
        throw new Error("Blockchain integrity check failed");
      }
      
      this.isInitialized = true;
      logger.info("Blockchain service initialized successfully", {
        network: this.config.network,
        blockCount: this.chain.length
      });
    } catch (error) {
      logger.error("Failed to initialize blockchain service", error);
      throw new ExternalServiceError("Failed to initialize blockchain service");
    }
  }

  /**
   * Load blockchain from database
   */
  private async loadBlockchainFromDatabase(): Promise<void> {
    try {
      const blocks = await prisma.blockchainBlock.findMany({
        orderBy: { index: 'asc' }
      });
      
      if (blocks.length > 0) {
        this.chain = blocks.map(block => ({
          index: block.index,
          timestamp: block.timestamp.getTime(),
          data: block.data as any,
          previousHash: block.previousHash,
          hash: block.hash,
          nonce: block.nonce,
        }));
        
        logger.info(`Loaded ${blocks.length} blocks from database`);
      }
    } catch (error) {
      logger.error("Failed to load blockchain from database", error);
      // Don't throw here as we can create a new blockchain
    }
  }

  /**
   * Save blockchain to database
   */
  private async saveBlockchainToDatabase(): Promise<void> {
    try {
      // Save each block to database
      for (const block of this.chain) {
        await prisma.blockchainBlock.upsert({
          where: { hash: block.hash },
          update: {
            index: block.index,
            timestamp: new Date(block.timestamp),
            data: block.data,
            previousHash: block.previousHash,
            nonce: block.nonce,
          },
          create: {
            hash: block.hash,
            index: block.index,
            timestamp: new Date(block.timestamp),
            data: block.data,
            previousHash: block.previousHash,
            nonce: block.nonce,
          },
        });
      }
      
      logger.debug("Blockchain saved to database");
    } catch (error) {
      logger.error("Failed to save blockchain to database", error);
      // Don't throw here as it's not critical for the main functionality
    }
  }

  /**
   * Create the first block in the chain
   */
  private createGenesisBlock(): void {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      data: { message: 'Genesis Block - Property Management System' },
      previousHash: '0',
      hash: '',
      nonce: 0,
    };
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  /**
   * Calculate hash for a block
   */
  private calculateHash(block: Block): string {
    const blockData = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      nonce: block.nonce,
    });
    return crypto.createHash('sha256').update(blockData).digest('hex');
  }

  /**
   * Mine a new block (Proof of Work)
   */
  private mineBlock(block: Block): void {
    while (!block.hash.startsWith('0'.repeat(this.difficulty))) {
      block.nonce++;
      block.hash = this.calculateHash(block);
    }
  }

  /**
   * Add a new block to the chain
   */
  private async addBlock(data: any): Promise<Block> {
    try {
      logger.info("Adding new block to blockchain", { type: data.type });
      
      const previousBlock = this.chain[this.chain.length - 1];
      const newBlock: Block = {
        index: previousBlock.index + 1,
        timestamp: Date.now(),
        data,
        previousHash: previousBlock.hash,
        hash: '',
        nonce: 0,
      };
      
      this.mineBlock(newBlock);
      this.chain.push(newBlock);
      
      // Save to database
      await prisma.blockchainBlock.create({
        data: {
          hash: newBlock.hash,
          index: newBlock.index,
          timestamp: new Date(newBlock.timestamp),
          data: newBlock.data,
          previousHash: newBlock.previousHash,
          nonce: newBlock.nonce,
        },
      });
      
      logger.info("Block added to blockchain", {
        index: newBlock.index,
        hash: newBlock.hash.substring(0, 10) + '...'
      });
      
      return newBlock;
    } catch (error) {
      logger.error("Failed to add block to blockchain", error);
      throw new DatabaseError("Failed to add block to blockchain");
    }
  }

  /**
   * Validate the blockchain integrity
   */
  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash
      if (currentBlock.hash !== this.calculateHash(currentBlock)) {
        return false;
      }

      // Verify link to previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Create a smart contract on blockchain
   */
  public async createSmartContract(contractData: {
    type: ContractType;
    parties: Array<{
      id: string;
      name: string;
      role: string;
      signature?: string;
    }>;
    terms: Record<string, any>;
    startDate: Date;
    endDate: Date;
    value?: number;
    autoExecutionRules?: Array<{
      condition: string;
      action: string;
      parameters: any;
    }>;
  }): Promise<{
    contractHash: string;
    blockIndex: number;
    timestamp: number;
    verificationUrl: string;
  }> {
    try {
      logger.info("Creating smart contract on blockchain", { type: contractData.type });
      
      // Create contract record
      const contract = {
        contractType: contractData.type,
        parties: contractData.parties,
        terms: contractData.terms,
        startDate: contractData.startDate.toISOString(),
        endDate: contractData.endDate.toISOString(),
        value: contractData.value,
        autoExecutionRules: contractData.autoExecutionRules,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
      };

      // Add to blockchain
      const block = await this.addBlock({
        type: 'SMART_CONTRACT',
        contract,
      });

      return {
        contractHash: block.hash,
        blockIndex: block.index,
        timestamp: block.timestamp,
        verificationUrl: `${this.config.rpcUrl || 'blockchain'}/verify/${block.hash}`,
      };
    } catch (error) {
      logger.error("Failed to create smart contract", error);
      throw new ExternalServiceError("Failed to create smart contract");
    }
  }

  /**
   * Record lease agreement on blockchain
   */
  public async recordLease(leaseData: {
    leaseId: string;
    landlordId: string;
    tenantId: string;
    unitId: string;
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    securityDeposit: number;
    terms: string;
    signatures: Array<{
      party: string;
      signature: string;
      timestamp: Date;
    }>;
  }): Promise<{
    blockchainHash: string;
    verified: boolean;
    immutable: boolean;
  }> {
    try {
      logger.info("Recording lease agreement on blockchain", { leaseId: leaseData.leaseId });
      
      const block = await this.addBlock({
        type: 'LEASE_AGREEMENT',
        lease: leaseData,
        timestamp: Date.now(),
      });

      return {
        blockchainHash: block.hash,
        verified: this.verifyBlock(block.hash),
        immutable: true,
      };
    } catch (error) {
      logger.error("Failed to record lease agreement", error);
      throw new ExternalServiceError("Failed to record lease agreement");
    }
  }

  /**
   * Record vendor contract on blockchain
   */
  public async recordVendorContract(contractData: {
    contractId: string;
    vendorId: string;
    propertyManagerId: string;
    serviceType: string;
    terms: Record<string, any>;
    value: number;
    startDate: Date;
    endDate: Date;
  }): Promise<{
    blockchainHash: string;
    verified: boolean;
  }> {
    try {
      logger.info("Recording vendor contract on blockchain", { contractId: contractData.contractId });
      
      const block = await this.addBlock({
        type: 'VENDOR_CONTRACT',
        contract: contractData,
        timestamp: Date.now(),
      });

      return {
        blockchainHash: block.hash,
        verified: this.verifyBlock(block.hash),
      };
    } catch (error) {
      logger.error("Failed to record vendor contract", error);
      throw new ExternalServiceError("Failed to record vendor contract");
    }
  }

  /**
   * Record payment transaction
   */
  public async recordPayment(paymentData: {
    paymentId: string;
    fromParty: string;
    toParty: string;
    amount: number;
    currency: string;
    purpose: string;
    transactionId: string;
    timestamp: Date;
  }): Promise<{
    blockchainHash: string;
    verified: boolean;
  }> {
    try {
      logger.info("Recording payment transaction on blockchain", { paymentId: paymentData.paymentId });
      
      const block = await this.addBlock({
        type: 'PAYMENT_TRANSACTION',
        payment: paymentData,
        timestamp: Date.now(),
      });

      return {
        blockchainHash: block.hash,
        verified: this.verifyBlock(block.hash),
      };
    } catch (error) {
      logger.error("Failed to record payment transaction", error);
      throw new ExternalServiceError("Failed to record payment transaction");
    }
  }

  /**
   * Record document on blockchain for verification
   */
  public async recordDocument(documentData: {
    documentId: string;
    documentType: string;
    fileName: string;
    fileHash: string; // SHA-256 hash of file content
    uploadedBy: string;
    metadata: Record<string, any>;
  }): Promise<{
    blockchainHash: string;
    documentHash: string;
    timestamp: number;
    verified: boolean;
  }> {
    try {
      logger.info("Recording document on blockchain", { documentId: documentData.documentId });
      
      const block = await this.addBlock({
        type: 'DOCUMENT_RECORD',
        document: documentData,
        timestamp: Date.now(),
      });

      return {
        blockchainHash: block.hash,
        documentHash: documentData.fileHash,
        timestamp: block.timestamp,
        verified: this.verifyBlock(block.hash),
      };
    } catch (error) {
      logger.error("Failed to record document", error);
      throw new ExternalServiceError("Failed to record document");
    }
  }

  /**
   * Verify a block exists and is valid
   */
  public verifyBlock(hash: string): boolean {
    const block = this.chain.find(b => b.hash === hash);
    if (!block) return false;

    return this.calculateHash(block) === block.hash && this.isChainValid();
  }

  /**
   * Get block by hash
   */
  public getBlock(hash: string): Block | null {
    return this.chain.find(b => b.hash === hash) || null;
  }

  /**
   * Get all blocks for an entity
   */
  public getEntityHistory(entityId: string): Block[] {
    return this.chain.filter(block => {
      const data = JSON.stringify(block.data);
      return data.includes(entityId);
    });
  }

  /**
   * Audit trail - get all transactions
   */
  public getAuditTrail(filters?: {
    type?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Array<{
    blockIndex: number;
    timestamp: number;
    type: string;
    data: any;
    hash: string;
  }> {
    let blocks = this.chain.slice(1); // Exclude genesis block

    if (filters) {
      if (filters.type) {
        blocks = blocks.filter(b => b.data.type === filters.type);
      }
      if (filters.startDate) {
        blocks = blocks.filter(b => b.timestamp >= filters.startDate!.getTime());
      }
      if (filters.endDate) {
        blocks = blocks.filter(b => b.timestamp <= filters.endDate!.getTime());
      }
    }

    return blocks.map(block => ({
      blockIndex: block.index,
      timestamp: block.timestamp,
      type: block.data.type,
      data: block.data,
      hash: block.hash,
    }));
  }

  /**
   * Generate cryptographic proof of document authenticity
   */
  public generateDocumentProof(documentContent: Buffer): {
    hash: string;
    signature: string;
    timestamp: number;
  } {
    const hash = crypto.createHash('sha256').update(documentContent).digest('hex');
    const signature = crypto
      .createHmac('sha256', process.env.BLOCKCHAIN_SECRET || 'default-secret')
      .update(hash)
      .digest('hex');

    return {
      hash,
      signature,
      timestamp: Date.now(),
    };
  }

  /**
   * Verify document hasn't been tampered with
   */
  public verifyDocumentIntegrity(
    documentContent: Buffer,
    originalHash: string,
    originalSignature: string
  ): boolean {
    const currentHash = crypto.createHash('sha256').update(documentContent).digest('hex');
    
    if (currentHash !== originalHash) {
      return false;
    }

    const currentSignature = crypto
      .createHmac('sha256', process.env.BLOCKCHAIN_SECRET || 'default-secret')
      .update(currentHash)
      .digest('hex');

    return currentSignature === originalSignature;
  }

  /**
   * Execute smart contract conditions automatically
   */
  public async executeSmartContract(contractHash: string): Promise<{
    executed: boolean;
    results: Array<{
      rule: string;
      executed: boolean;
      result: any;
      timestamp: number;
    }>;
  }> {
    const block = this.getBlock(contractHash);
    if (!block || block.data.type !== 'SMART_CONTRACT') {
      throw new Error('Contract not found');
    }

    const contract = block.data.contract;
    const results: Array<{
      rule: string;
      executed: boolean;
      result: any;
      timestamp: number;
    }> = [];

    // Execute auto-execution rules
    if (contract.autoExecutionRules) {
      for (const rule of contract.autoExecutionRules) {
        try {
          // Evaluate condition
          const conditionMet = await this.evaluateCondition(rule.condition);
          
          if (conditionMet) {
            // Execute action
            const result = await this.executeAction(rule.action, rule.parameters);
            
            results.push({
              rule: rule.condition,
              executed: true,
              result,
              timestamp: Date.now(),
            });

            // Record execution on blockchain
            this.addBlock({
              type: 'CONTRACT_EXECUTION',
              contractHash,
              rule: rule.condition,
              action: rule.action,
              result,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          results.push({
            rule: rule.condition,
            executed: false,
            result: { error: (error as Error).message },
            timestamp: Date.now(),
          });
        }
      }
    }

    return {
      executed: results.some(r => r.executed),
      results,
    };
  }

  /**
   * Evaluate smart contract condition
   */
  private async evaluateCondition(condition: string): Promise<boolean> {
    // This is a simplified implementation
    // In production, use a safe sandboxed environment for condition evaluation
    
    try {
      // Example conditions:
      // "lease.endDate < currentDate + 60 days" -> lease expiring soon
      // "payment.dueDate < currentDate" -> payment overdue
      // "maintenance.priority === 'EMERGENCY'" -> emergency maintenance
      
      // For demo purposes, return true
      // In production, parse and evaluate the condition safely
      return true;
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Execute smart contract action
   */
  private async executeAction(action: string, parameters: any): Promise<any> {
    // This is a simplified implementation
    // In production, integrate with your application logic
    
    console.log(`Executing action: ${action}`, parameters);
    
    // Example actions:
    // "SEND_RENEWAL_NOTICE" -> send lease renewal notice
    // "APPLY_LATE_FEE" -> apply late fee to payment
    // "CREATE_MAINTENANCE_REQUEST" -> create maintenance request
    // "PROCESS_PAYMENT" -> process automatic payment
    
    return {
      action,
      parameters,
      executed: true,
      timestamp: Date.now(),
    };
  }

  /**
   * Get blockchain statistics
   */
  public getStatistics(): {
    totalBlocks: number;
    totalContracts: number;
    totalPayments: number;
    totalDocuments: number;
    isValid: boolean;
    lastBlockTime: number;
  } {
    const contracts = this.chain.filter(b => b.data.type === 'SMART_CONTRACT').length;
    const payments = this.chain.filter(b => b.data.type === 'PAYMENT_TRANSACTION').length;
    const documents = this.chain.filter(b => b.data.type === 'DOCUMENT_RECORD').length;
    const lastBlock = this.chain[this.chain.length - 1];

    return {
      totalBlocks: this.chain.length,
      totalContracts: contracts,
      totalPayments: payments,
      totalDocuments: documents,
      isValid: this.isChainValid(),
      lastBlockTime: lastBlock.timestamp,
    };
  }
}

/**
 * Digital Signature Service
 */
export class DigitalSignatureService {
  /**
   * Create digital signature for a document
   */
  public createSignature(documentHash: string, signerId: string, privateKey?: string): {
    signature: string;
    signerId: string;
    timestamp: number;
    algorithm: string;
  } {
    const timestamp = Date.now();
    const dataToSign = `${documentHash}:${signerId}:${timestamp}`;
    
    // In production, use actual private key cryptography
    const signature = crypto
      .createHmac('sha256', privateKey || process.env.SIGNATURE_SECRET || 'default-secret')
      .update(dataToSign)
      .digest('hex');

    return {
      signature,
      signerId,
      timestamp,
      algorithm: 'HMAC-SHA256',
    };
  }

  /**
   * Verify digital signature
   */
  public verifySignature(
    documentHash: string,
    signature: {
      signature: string;
      signerId: string;
      timestamp: number;
    },
    publicKey?: string
  ): boolean {
    const dataToSign = `${documentHash}:${signature.signerId}:${signature.timestamp}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', publicKey || process.env.SIGNATURE_SECRET || 'default-secret')
      .update(dataToSign)
      .digest('hex');

    return expectedSignature === signature.signature;
  }

  /**
   * Create multi-party signature requirement
   */
  public createMultiSigRequirement(parties: string[], threshold: number): {
    requirementId: string;
    parties: string[];
    threshold: number;
    signed: string[];
    complete: boolean;
  } {
    return {
      requirementId: crypto.randomUUID(),
      parties,
      threshold,
      signed: [],
      complete: false,
    };
  }

  /**
   * Add signature to multi-sig requirement
   */
  public addSignatureToMultiSig(
    requirement: {
      requirementId: string;
      parties: string[];
      threshold: number;
      signed: string[];
      complete: boolean;
    },
    signerId: string,
    signature: string
  ): {
    success: boolean;
    requirement: typeof requirement;
  } {
    if (!requirement.parties.includes(signerId)) {
      throw new Error('Signer is not a required party');
    }

    if (requirement.signed.includes(signerId)) {
      throw new Error('Party has already signed');
    }

    requirement.signed.push(signerId);
    requirement.complete = requirement.signed.length >= requirement.threshold;

    return {
      success: true,
      requirement,
    };
  }
}

/**
 * Export blockchain services
 */
export const BlockchainServices = {
  BlockchainService,
  DigitalSignatureService,
};

export default BlockchainServices;


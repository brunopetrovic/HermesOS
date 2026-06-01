import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getConnection } from '@/lib/connection';

interface Skill {
  name: string;
  description: string;
  version?: string;
  author?: string;
  tags: string[];
  source: 'custom' | 'bundled';
  deprecated: boolean;
  hasCron: boolean;
  files: string[];
  contentPreview: string;
}

function parseFrontmatter(content: string): Record<string, string | string[]> {
  const frontmatter: Record<string, string | string[]> = {};
  
  // Match YAML frontmatter between --- delimiters
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return frontmatter;
  
  const yaml = match[1];
  for (const line of yaml.split('\n')) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (kvMatch) {
      const key = kvMatch[1];
      const value = kvMatch[2].trim();
      
      // Parse array syntax: [tag1, tag2, ...]
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[key] = value
          .slice(1, -1)
          .split(',')
          .map(v => v.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        frontmatter[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  
  return frontmatter;
}

async function scanSkillDir(dirPath: string, source: 'custom' | 'bundled'): Promise<Skill[]> {
  const skills: Skill[] = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      
      const skillDir = path.join(dirPath, entry.name);
      const skillMdPath = path.join(skillDir, 'SKILL.md');
      
      try {
        const content = await fs.readFile(skillMdPath, 'utf-8');
        const frontmatter = parseFrontmatter(content);
        
        // Check for deprecated marker
        const isDeprecated = content.toLowerCase().includes('# deprecated') || 
                            content.toLowerCase().includes('has been replaced') ||
                            content.toLowerCase().includes('has been fused');
        
        // Check for cron.yaml
        let hasCron = false;
        try {
          await fs.access(path.join(skillDir, 'cron.yaml'));
          hasCron = true;
        } catch {
          // No cron file
        }
        
        // Get file listing
        const files = await fs.readdir(skillDir);
        
        // Get description from frontmatter or first paragraph
        let description = (frontmatter.description as string) || '';
        if (!description) {
          // Extract from content after frontmatter
          const contentBody = content.replace(/^---[\s\S]*?---/, '').trim();
          const firstParagraph = contentBody
            .split('\n')
            .filter(l => !l.startsWith('#') && l.trim().length > 0)
            .slice(0, 2)
            .join(' ');
          description = firstParagraph.slice(0, 200);
        }
        
        // Preview: first 300 chars of the body (strip frontmatter and headers)
        const contentBody = content.replace(/^---[\s\S]*?---/, '').trim();
        const preview = contentBody
          .split('\n')
          .filter(l => !l.startsWith('#') && l.trim().length > 0)
          .join('\n')
          .slice(0, 300);
        
        skills.push({
          name: (frontmatter.name as string) || entry.name,
          description,
          version: frontmatter.version as string,
          author: frontmatter.author as string,
          tags: (frontmatter.tags as string[]) || [],
          source,
          deprecated: isDeprecated,
          hasCron,
          files,
          contentPreview: preview,
        });
      } catch {
        // SKILL.md not found — still list the skill directory
        const files = await fs.readdir(skillDir).catch(() => [] as string[]);
        skills.push({
          name: entry.name,
          description: '',
          tags: [],
          source,
          deprecated: false,
          hasCron: files.includes('cron.yaml'),
          files,
          contentPreview: '',
        });
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return skills;
}

export async function GET() {
  try {
    const conn = await getConnection();
    const hermesHome =
      conn?.homePath || process.env.HERMES_HOME || path.join(process.env.HOME || '', '.hermes');

    // Scan both custom and bundled skill directories
    const customSkills = await scanSkillDir(path.join(hermesHome, 'skills'), 'custom');
    const bundledSkills = await scanSkillDir(
      path.join(hermesHome, 'hermes-agent', 'skills'), 'bundled'
    );
    
    const allSkills = [...customSkills, ...bundledSkills]
      .sort((a, b) => {
        // Active skills first, deprecated last
        if (a.deprecated !== b.deprecated) return a.deprecated ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
    
    // Collect unique tags
    const allTags = [...new Set(allSkills.flatMap(s => s.tags))].sort();
    
    return NextResponse.json({
      skills: allSkills,
      totalSkills: allSkills.length,
      customSkills: customSkills.length,
      bundledSkills: bundledSkills.length,
      activeSkills: allSkills.filter(s => !s.deprecated).length,
      deprecatedSkills: allSkills.filter(s => s.deprecated).length,
      cronLinkedSkills: allSkills.filter(s => s.hasCron).length,
      allTags,
      source: 'hermes-native',
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Hermes Skills Error:', error);
    return NextResponse.json({ error: 'Failed to read Hermes skills' }, { status: 500 });
  }
}

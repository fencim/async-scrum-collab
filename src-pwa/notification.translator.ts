import { ILoggable, IProfile } from 'src/entities';
import { Iteration } from 'src/workflows/iteration/definition';
import { Discussion } from 'src/workflows/discussion/definition';
import { Project } from 'src/workflows/project/definition';
import { firebaseService } from 'src/services/firebase.service';
import { entityKey } from 'src/entities/base.entity';
type WorkflowStructs = Iteration | Discussion | Project;

export async function translateLogToNotification(log: ILoggable) {
  const opKey = typeof log.operator == 'object' ? log.operator.key : log.operator;
  const operator = await firebaseService.get('profiles', opKey) as (IProfile | undefined);
  const type = log.type as WorkflowStructs['type'];
  const badge = operator?.avatar;
  let title = log.project + ':' + type;
  let body = '';
  if (log.kind == 'operation') {
    const operation = {
      type: type,
      arg: log.data
    } as WorkflowStructs;
    switch (operation.type) {
      case 'sendMessage':
        title = `${operator?.name || 'User'} sent message on ${operation.arg.discussion}`;
        body = operation.arg.message;
        break;
      case 'askQuestion':
        title = `${operator?.name || 'User'} have question on ${entityKey(operation.arg.item)}`;
        body = operation.arg.message;
        break;
      case 'replyToMessage':
        title = `${operator?.name || 'User'} responded ${entityKey(operation.arg.item)}`;
        body = `${operation.arg.ref.message} >> ${operation.arg.message}`;
        break;
      case 'resolveQuestionOf':
        title = `${operator?.name || 'User'} resolved the question on ${entityKey(operation.arg.item)}`;
        body = `${operation.arg.message} (with ${operation.arg.resolution})`;
        break;
      case 'assignTask':
        title = `${operator?.name || 'User'} assigned ${entityKey(operation.arg.item.key)}`;
        body = `to ${operation.arg.profile.name}`;
        break;
      case 'confirmAgreement':
        title = `${operator?.name || 'User'} confirmed ${entityKey(operation.arg.item.key)}`;
        body = `${operation.arg.message}.`;
        break;
      case 'acceptSprintResult':
        title = `${operator?.name || 'User'} has accepted result of sprint ${entityKey(operation.arg.review.iterationKey)}`;
        body = `Completed: ${operation.arg.completed}, Missed: ${operation.arg.missed} on ${operation.arg.review.key}`;
        break;
      case 'createDiscussion':
        title = `${operator?.name || 'User'} created new ${operation.arg.item.type}`;
        body = `Sprint : ${operation.arg.iterationKey}, Key: ${operation.arg.item.key
          }`;
        break;
      case 'createIteration':
        title = `${operator?.name || 'User'} created new sprint ${operation.arg.details.name}`;
        body = `Start : ${operation.arg.details.start}, End: ${operation.arg.details.end}`;
        break;
      case 'moveIssue':
        title = `${operator?.name || 'User'} moved issue ${operation.arg.item.key}`;
        if (operation.arg.column) {
          body = `From : ${operation.arg.item.status}, To: ${operation.arg.column}`;
        } else if (operation.arg.iterationKey) {
          body = `From : ${operation.arg.item.iteration && entityKey(operation.arg.item.iteration)}, To: ${operation.arg.iterationKey}`;
        }
        break;
      case 'voteForComplexity':
        title = `${operator?.name || 'User'} voted for ${operation.arg.item.key}`;
        body = `${operation.arg.item.type}`;
        break;
      case 'voteForConfidence':
        title = `${operator?.name || 'User'} voted confidence for planning ${operation.arg.ceremony.key}`;
        body = `Sprint: ${operation.arg.ceremony.iterationKey}`;
        break;
      case 'deleteIssue':
        title = `${operator?.name || 'User'} deleted item ${operation.arg.item.key}`;
        body = `Sprint: ${operation.arg.item.iteration && entityKey(operation.arg.item.iteration)}`;
        break;
      case 'deleteIteration':
        title = `${operator?.name || 'User'} deleted sprint ${operation.arg.iteration.key}`;
        body = `Sprint: ${operation.arg.iteration.name})}`;
        break;
      case 'retroFeedback':
        title = `${operator?.name || 'User'} shared feedback on ${operation.arg.discussion}`;
        body = `${operation.arg.message})}`;
        break;
      case 'mergeFeedbackWith':
        title = `${operator?.name || 'User'} merged on ${operation.arg.message}`;
        body = `with ${operation.arg.withMsg})}`;
        break;
      case 'resetConfidenceVoting':
        title = `${operator?.name || 'User'} reset confidence voting for ${operation.arg.ceremony.key}`;
        body = `from: ${operation.arg.ceremony.confidence})}`;
        break;
      case 'updateProject':
        title = `${operator?.name || 'User'} updated project ${operation.arg.project.name}`;
        body = `from: ${operation.arg.project.name})}`;
        break;
      case 'updateProjectSettings':
        title = `${operator?.name || 'User'} set project ${operation.arg.settings}`;
        body = ` ${entityKey(operation.arg.project)}`;
        break;
    }
  }
  return {
    title,
    body,
    badge
  }
}
